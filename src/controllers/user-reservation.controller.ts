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
  User,
  Reservation,
} from '../models';
import {UserRepository} from '../repositories';

export class UserReservationController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/reservations', {
    responses: {
      '200': {
        description: 'Array of User has many Reservation',
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
    return this.userRepository.reservations(id).find(filter);
  }

  @post('/users/{id}/reservations', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Reservation)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Reservation, {
            title: 'NewReservationInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) reservation: Omit<Reservation, 'id'>,
  ): Promise<Reservation> {
    return this.userRepository.reservations(id).create(reservation);
  }

  @patch('/users/{id}/reservations', {
    responses: {
      '200': {
        description: 'User.Reservation PATCH success count',
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
    return this.userRepository.reservations(id).patch(reservation, where);
  }

  @del('/users/{id}/reservations', {
    responses: {
      '200': {
        description: 'User.Reservation DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Reservation)) where?: Where<Reservation>,
  ): Promise<Count> {
    return this.userRepository.reservations(id).delete(where);
  }
}
