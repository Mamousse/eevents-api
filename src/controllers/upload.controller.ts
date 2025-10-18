import {
  Request,
  Response,
  RestBindings,
  post,
  requestBody,
} from '@loopback/rest';
import {inject} from '@loopback/core';
import multer from 'multer';
import path from 'path';
import {promisify} from 'util';
import fs from 'fs';

const mkdir = promisify(fs.mkdir);

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../public/uploads');

    // Créer le dossier s'il n'existe pas
    try {
      await mkdir(uploadPath, {recursive: true});
    } catch (err) {
      // Le dossier existe déjà
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter seulement les images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

export class UploadController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {}

  @post('/upload', {
    responses: {
      200: {
        description: 'Upload de fichier réussi',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                url: {type: 'string'},
                filename: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async upload(
    @requestBody({
      description: 'Fichier à uploader',
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
      },
    })
    request: Request,
  ): Promise<{url: string; filename: string}> {
    return new Promise<{url: string; filename: string}>((resolve, reject) => {
      upload.single('file')(request, this.response, (err: any) => {
        if (err) {
          reject(err);
        } else {
          const file = (request as any).file;
          if (!file) {
            reject(new Error('Aucun fichier fourni'));
          } else {
            const fileUrl = `/uploads/${file.filename}`;
            resolve({
              url: fileUrl,
              filename: file.filename,
            });
          }
        }
      });
    });
  }

  @post('/upload/multiple', {
    responses: {
      200: {
        description: 'Upload de plusieurs fichiers réussi',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {type: 'string'},
                  filename: {type: 'string'},
                },
              },
            },
          },
        },
      },
    },
  })
  async uploadMultiple(
    @requestBody({
      description: 'Fichiers à uploader',
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
        },
      },
    })
    request: Request,
  ): Promise<{url: string; filename: string}[]> {
    return new Promise<{url: string; filename: string}[]>((resolve, reject) => {
      upload.array('files', 10)(request, this.response, (err: any) => {
        if (err) {
          reject(err);
        } else {
          const files = (request as any).files;
          if (!files || files.length === 0) {
            reject(new Error('Aucun fichier fourni'));
          } else {
            const uploadedFiles = files.map((file: any) => ({
              url: `/uploads/${file.filename}`,
              filename: file.filename,
            }));
            resolve(uploadedFiles);
          }
        }
      });
    });
  }
}
