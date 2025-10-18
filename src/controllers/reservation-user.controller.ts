import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Reservation,
  User,
} from '../models';
import {ReservationRepository} from '../repositories';

export class ReservationUserController {
  constructor(
    @repository(ReservationRepository)
    public reservationRepository: ReservationRepository,
  ) { }

  @get('/reservations/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Reservation',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof Reservation.prototype.id,
  ): Promise<User> {
    return this.reservationRepository.user(id);
  }
}
