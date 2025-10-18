import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Secret key pour JWT - EN PRODUCTION, utilisez une variable d'environnement !
const JWT_SECRET = 'votre-secret-key-super-securisee-changez-moi-en-production';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  prenom: string;
  nom: string;
  telephone: string;
  username: string;
  password: string;
  email?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
    prenom: string;
    nom: string;
    telephone: string;
    role: string;
  };
}

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  // Inscription
  @post('/auth/register')
  @response(200, {
    description: 'Inscription d\'un nouvel utilisateur',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['prenom', 'nom', 'telephone', 'username', 'password'],
            properties: {
              prenom: {type: 'string'},
              nom: {type: 'string'},
              telephone: {type: 'string'},
              username: {type: 'string'},
              password: {type: 'string'},
              email: {type: 'string'},
            },
          },
        },
      },
    })
    credentials: RegisterRequest,
  ): Promise<User> {
    // Vérifier si l'username existe déjà
    const existingUser = await this.userRepository.findOne({
      where: {username: credentials.username},
    });

    if (existingUser) {
      throw new HttpErrors.Conflict('Ce nom d\'utilisateur existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    // Créer l'utilisateur avec le rôle 'user' par défaut
    const newUser = await this.userRepository.create({
      prenom: credentials.prenom,
      nom: credentials.nom,
      telephone: credentials.telephone,
      username: credentials.username,
      password: hashedPassword,
      email: credentials.email,
      role: 'user', // Rôle par défaut
      createdAt: new Date(),
    });

    // Retourner l'utilisateur sans le mot de passe
    delete (newUser as any).password;
    return newUser;
  }

  // Connexion
  @post('/auth/login')
  @response(200, {
    description: 'Connexion d\'un utilisateur',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {type: 'string'},
            user: {
              type: 'object',
              properties: {
                id: {type: 'string'},
                username: {type: 'string'},
                email: {type: 'string'},
                prenom: {type: 'string'},
                nom: {type: 'string'},
                role: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
            },
          },
        },
      },
    })
    credentials: LoginRequest,
  ): Promise<AuthResponse> {
    // Trouver l'utilisateur
    const user = await this.userRepository.findOne({
      where: {username: credentials.username},
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpErrors.Unauthorized('Identifiants invalides');
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      {expiresIn: '24h'},
    );

    // Retourner la réponse
    return {
      token,
      user: {
        id: user.id!,
        username: user.username,
        email: user.email,
        prenom: user.prenom,
        nom: user.nom,
        telephone: user.telephone,
        role: user.role,
      },
    };
  }

  // Récupérer tous les utilisateurs (admin seulement)
  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {exclude: ['password']}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    const users = await this.userRepository.find(filter);
    // Retirer les mots de passe
    return users.map(user => {
      delete (user as any).password;
      return user;
    });
  }

  // Compter les utilisateurs
  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  // Récupérer un utilisateur par ID
  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {exclude: ['password']}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'})
    filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    const user = await this.userRepository.findById(id, filter);
    delete (user as any).password;
    return user;
  }

  // Mettre à jour un utilisateur (incluant le rôle)
  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            partial: true,
            exclude: ['password'],
          }),
        },
      },
    })
    user: Partial<User>,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  // Mettre à jour le rôle d'un utilisateur (admin seulement)
  @patch('/users/{id}/role')
  @response(204, {
    description: 'User role update success',
  })
  async updateUserRole(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['role'],
            properties: {
              role: {type: 'string', enum: ['user', 'admin']},
            },
          },
        },
      },
    })
    data: {role: 'admin' | 'user'},
  ): Promise<void> {
    await this.userRepository.updateById(id, {role: data.role as 'admin' | 'user'});
  }

  // Changer le mot de passe
  @patch('/users/{id}/password')
  @response(204, {
    description: 'Password update success',
  })
  async updatePassword(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['currentPassword', 'newPassword'],
            properties: {
              currentPassword: {type: 'string'},
              newPassword: {type: 'string'},
            },
          },
        },
      },
    })
    passwords: {currentPassword: string; newPassword: string},
  ): Promise<void> {
    const user = await this.userRepository.findById(id);

    // Vérifier le mot de passe actuel
    const isValid = await bcrypt.compare(
      passwords.currentPassword,
      user.password,
    );

    if (!isValid) {
      throw new HttpErrors.Unauthorized('Mot de passe actuel incorrect');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);

    // Mettre à jour
    await this.userRepository.updateById(id, {password: hashedPassword});
  }

  // Supprimer un utilisateur
  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  // Créer un utilisateur admin (pour initialisation)
  @post('/auth/create-admin')
  @response(200, {
    description: 'Création d\'un compte administrateur',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async createAdmin(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['prenom', 'nom', 'telephone', 'username', 'password'],
            properties: {
              prenom: {type: 'string'},
              nom: {type: 'string'},
              telephone: {type: 'string'},
              username: {type: 'string'},
              password: {type: 'string'},
              email: {type: 'string'},
            },
          },
        },
      },
    })
    credentials: RegisterRequest,
  ): Promise<User> {
    // Vérifier si un admin existe déjà
    const existingAdmin = await this.userRepository.findOne({
      where: {role: 'admin'},
    });

    if (existingAdmin) {
      throw new HttpErrors.Conflict(
        'Un compte administrateur existe déjà. Utilisez la fonctionnalité de mise à jour des rôles.',
      );
    }

    // Vérifier si l'username existe
    const existingUser = await this.userRepository.findOne({
      where: {username: credentials.username},
    });

    if (existingUser) {
      throw new HttpErrors.Conflict('Ce nom d\'utilisateur existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    // Créer l'admin
    const newAdmin = await this.userRepository.create({
      prenom: credentials.prenom,
      nom: credentials.nom,
      telephone: credentials.telephone,
      username: credentials.username,
      password: hashedPassword,
      email: credentials.email,
      role: 'admin',
      createdAt: new Date(),
    });

    delete (newAdmin as any).password;
    return newAdmin;
  }
}
