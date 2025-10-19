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
import {inject} from '@loopback/core';
import {Reservation, Event} from '../models';
import {ReservationRepository, EventRepository} from '../repositories';
import {QrcodeService} from '../services/qrcode.service';
import {WhatsappService} from '../services/whatsapp.service';

export class ReservationController {
  constructor(
    @repository(ReservationRepository)
    public reservationRepository : ReservationRepository,
    @repository(EventRepository)
    public eventRepository : EventRepository,
    @inject('services.QrcodeService')
    public qrcodeService: QrcodeService,
    @inject('services.WhatsappService')
    public whatsappService: WhatsappService,
  ) {}

  @post('/reservations')
  @response(200, {
    description: 'Reservation model instance',
    content: {'application/json': {schema: getModelSchemaRef(Reservation)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reservation, {
            title: 'NewReservation',
            exclude: ['id'],
          }),
        },
      },
    })
    reservation: Omit<Reservation, 'id'>,
  ): Promise<Reservation> {
    // Créer la réservation
    const newReservation = await this.reservationRepository.create(reservation);

    // Si la réservation est payée, générer le QR code et l'envoyer par WhatsApp
    if (newReservation.estPaye) {
      try {
        // Générer le QR code
        const qrCode = await this.qrcodeService.generateQRCode(
          newReservation.id!,
          newReservation.eventId,
        );

        // Mettre à jour la réservation avec le QR code
        await this.reservationRepository.updateById(newReservation.id, {qrCode});

        // Récupérer les détails de l'événement
        const event = await this.eventRepository.findById(newReservation.eventId);

        // Envoyer le QR code par WhatsApp
        await this.whatsappService.sendReservationQRCode(
          newReservation.numeroWhatsapp,
          qrCode,
          {
            eventName: event.nom,
            eventDate: event.date.toLocaleString('fr-FR'),
            nombrePlaces: newReservation.nombrePlaces,
            montantTotal: newReservation.montantTotal,
            nom: newReservation.nom,
            prenom: newReservation.prenom,
          },
        );

        // Retourner la réservation mise à jour
        newReservation.qrCode = qrCode;
      } catch (error) {
        console.error('Erreur lors de la génération/envoi du QR code:', error);
        // La réservation est créée mais le QR code n'a pas pu être envoyé
        // On ne bloque pas la création de la réservation
      }
    }

    return newReservation;
  }

  @get('/reservations/count')
  @response(200, {
    description: 'Reservation model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Reservation) where?: Where<Reservation>,
  ): Promise<Count> {
    return this.reservationRepository.count(where);
  }

  @get('/reservations')
  @response(200, {
    description: 'Array of Reservation model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Reservation, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Reservation) filter?: Filter<Reservation>,
  ): Promise<Reservation[]> {
    return this.reservationRepository.find(filter);
  }

  @patch('/reservations')
  @response(200, {
    description: 'Reservation PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reservation, {partial: true}),
        },
      },
    })
    reservation: Reservation,
    @param.where(Reservation) where?: Where<Reservation>,
  ): Promise<Count> {
    return this.reservationRepository.updateAll(reservation, where);
  }

  @get('/reservations/{id}')
  @response(200, {
    description: 'Reservation model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Reservation, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Reservation, {exclude: 'where'}) filter?: FilterExcludingWhere<Reservation>
  ): Promise<Reservation> {
    return this.reservationRepository.findById(id, filter);
  }

  @patch('/reservations/{id}')
  @response(204, {
    description: 'Reservation PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reservation, {partial: true}),
        },
      },
    })
    reservation: Reservation,
  ): Promise<void> {
    await this.reservationRepository.updateById(id, reservation);
  }

  @put('/reservations/{id}')
  @response(204, {
    description: 'Reservation PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() reservation: Reservation,
  ): Promise<void> {
    await this.reservationRepository.replaceById(id, reservation);
  }

  @del('/reservations/{id}')
  @response(204, {
    description: 'Reservation DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.reservationRepository.deleteById(id);
  }

  @post('/reservations/scan-qr')
  @response(200, {
    description: 'Scan and validate QR code',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {type: 'boolean'},
            message: {type: 'string'},
            reservation: {type: 'object'},
          },
        },
      },
    },
  })
  async scanQRCode(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['qrData'],
            properties: {
              qrData: {type: 'string'},
            },
          },
        },
      },
    })
    body: {qrData: string},
  ): Promise<{success: boolean; message: string; reservation?: Reservation}> {
    try {
      // Décoder le QR code
      const decoded = this.qrcodeService.decodeQRCode(body.qrData);

      // Récupérer la réservation
      const reservation = await this.reservationRepository.findById(decoded.reservationId);

      // Vérifier que la réservation existe
      if (!reservation) {
        throw new HttpErrors.NotFound('Réservation introuvable');
      }

      // Vérifier que la réservation est payée
      if (!reservation.estPaye) {
        return {
          success: false,
          message: 'Cette réservation n\'a pas été payée',
          reservation,
        };
      }

      // Vérifier si la réservation a déjà été utilisée
      if (reservation.used) {
        return {
          success: false,
          message: `Ce ticket a déjà été utilisé le ${reservation.dateUtilisation?.toLocaleString('fr-FR')}`,
          reservation,
        };
      }

      // Marquer la réservation comme utilisée
      await this.reservationRepository.updateById(reservation.id, {
        used: true,
        dateUtilisation: new Date(),
      });

      // Récupérer la réservation mise à jour
      const updatedReservation = await this.reservationRepository.findById(reservation.id);

      return {
        success: true,
        message: 'Ticket validé avec succès ! Bienvenue.',
        reservation: updatedReservation,
      };
    } catch (error) {
      console.error('Erreur lors du scan du QR code:', error);
      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }
      throw new HttpErrors.BadRequest('QR code invalide ou erreur lors de la validation');
    }
  }

  @patch('/reservations/{id}/payment')
  @response(200, {
    description: 'Update payment status and send QR code',
    content: {'application/json': {schema: getModelSchemaRef(Reservation)}},
  })
  async updatePaymentStatus(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['estPaye'],
            properties: {
              estPaye: {type: 'boolean'},
            },
          },
        },
      },
    })
    body: {estPaye: boolean},
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);

    // Si on passe la réservation à payée et qu'elle ne l'était pas avant
    if (body.estPaye && !reservation.estPaye) {
      try {
        // Générer le QR code
        const qrCode = await this.qrcodeService.generateQRCode(
          reservation.id!,
          reservation.eventId,
        );

        // Récupérer les détails de l'événement
        const event = await this.eventRepository.findById(reservation.eventId);

        // Envoyer le QR code par WhatsApp
        await this.whatsappService.sendReservationQRCode(
          reservation.numeroWhatsapp,
          qrCode,
          {
            eventName: event.nom,
            eventDate: event.date.toLocaleString('fr-FR'),
            nombrePlaces: reservation.nombrePlaces,
            montantTotal: reservation.montantTotal,
            nom: reservation.nom,
            prenom: reservation.prenom,
          },
        );

        // Mettre à jour la réservation
        await this.reservationRepository.updateById(id, {
          estPaye: true,
          qrCode,
        });
      } catch (error) {
        console.error('Erreur lors de la génération/envoi du QR code:', error);
        // On met quand même à jour le statut de paiement
        await this.reservationRepository.updateById(id, {estPaye: true});
      }
    } else {
      await this.reservationRepository.updateById(id, {estPaye: body.estPaye});
    }

    return this.reservationRepository.findById(id);
  }
}
