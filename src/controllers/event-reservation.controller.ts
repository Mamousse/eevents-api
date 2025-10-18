import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Event,
  Reservation,
} from '../models';
import {EventRepository} from '../repositories';

export class EventReservationController {
  constructor(
    @repository(EventRepository) protected eventRepository: EventRepository,
  ) { }

  @get('/events/{id}/reservations', {
    responses: {
      '200': {
        description: 'Array of Event has many Reservation',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Reservation)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Reservation>,
  ): Promise<Reservation[]> {
    return this.eventRepository.reservations(id).find(filter);
  }

  @post('/events/{id}/reservations', {
    responses: {
      '200': {
        description: 'Event model instance',
        content: {'application/json': {schema: getModelSchemaRef(Reservation)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Event.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reservation, {
            title: 'NewReservationInEvent',
            exclude: ['id'],
            optional: ['eventId']
          }),
        },
      },
    }) reservation: Omit<Reservation, 'id'>,
  ): Promise<Reservation> {
    return this.eventRepository.reservations(id).create(reservation);
  }

  @patch('/events/{id}/reservations', {
    responses: {
      '200': {
        description: 'Event.Reservation PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reservation, {partial: true}),
        },
      },
    })
    reservation: Partial<Reservation>,
    @param.query.object('where', getWhereSchemaFor(Reservation)) where?: Where<Reservation>,
  ): Promise<Count> {
    return this.eventRepository.reservations(id).patch(reservation, where);
  }

  @del('/events/{id}/reservations', {
    responses: {
      '200': {
        description: 'Event.Reservation DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Reservation)) where?: Where<Reservation>,
  ): Promise<Count> {
    return this.eventRepository.reservations(id).delete(where);
  }
}
