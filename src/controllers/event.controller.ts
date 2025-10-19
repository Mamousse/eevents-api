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
} from '@loopback/rest';
import {inject} from '@loopback/core';
import {Event} from '../models';
import {EventRepository} from '../repositories';
import {WhatsappService} from '../services/whatsapp.service';

export class EventController {
  constructor(
    @repository(EventRepository)
    public eventRepository : EventRepository,
    @inject('services.WhatsappService')
    public whatsappService: WhatsappService,
  ) {}

  @post('/events')
  @response(200, {
    description: 'Event model instance',
    content: {'application/json': {schema: getModelSchemaRef(Event)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {
            title: 'NewEvent',
            exclude: ['id'],
          }),
        },
      },
    })
    event: Omit<Event, 'id'>,
  ): Promise<Event> {
    return this.eventRepository.create(event);
  }

  @get('/events/count')
  @response(200, {
    description: 'Event model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Event) where?: Where<Event>,
  ): Promise<Count> {
    return this.eventRepository.count(where);
  }

  @get('/events')
  @response(200, {
    description: 'Array of Event model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Event, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Event) filter?: Filter<Event>,
  ): Promise<Event[]> {
    return this.eventRepository.find(filter);
  }

  @patch('/events')
  @response(200, {
    description: 'Event PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Event,
    @param.where(Event) where?: Where<Event>,
  ): Promise<Count> {
    return this.eventRepository.updateAll(event, where);
  }

  @get('/events/{id}')
  @response(200, {
    description: 'Event model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Event, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Event, {exclude: 'where'}) filter?: FilterExcludingWhere<Event>
  ): Promise<Event> {
    return this.eventRepository.findById(id, filter);
  }

  @patch('/events/{id}')
  @response(204, {
    description: 'Event PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Event, {partial: true}),
        },
      },
    })
    event: Event,
  ): Promise<void> {
    await this.eventRepository.updateById(id, event);
  }

  @put('/events/{id}')
  @response(204, {
    description: 'Event PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() event: Event,
  ): Promise<void> {
    await this.eventRepository.replaceById(id, event);
  }

  @del('/events/{id}')
  @response(204, {
    description: 'Event DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.eventRepository.deleteById(id);
  }

  @post('/events/{id}/share-whatsapp-link')
  @response(200, {
    description: 'Generate WhatsApp share link for event',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            shareLink: {type: 'string'},
            message: {type: 'string'},
          },
        },
      },
    },
  })
  async getWhatsAppShareLink(
    @param.path.string('id') id: string,
  ): Promise<{shareLink: string; message: string}> {
    const event = await this.eventRepository.findById(id);

    const eventUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/events/${event.id}`;

    // Calculer le prix minimum depuis modalitesEntree
    const prixMin = event.modalitesEntree && event.modalitesEntree.length > 0
      ? Math.min(...event.modalitesEntree.map(m => m.prix))
      : 0;

    const shareLink = this.whatsappService.generateShareLink({
      name: event.nom,
      description: event.description || 'Événement à venir',
      date: event.date.toLocaleString('fr-FR'),
      lieu: event.emplacement,
      prixEntree: prixMin,
      eventUrl,
    });

    return {
      shareLink,
      message: 'Lien de partage WhatsApp généré avec succès',
    };
  }
}
