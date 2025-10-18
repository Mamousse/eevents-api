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
  Event,
} from '../models';
import {ReservationRepository} from '../repositories';

export class ReservationEventController {
  constructor(
    @repository(ReservationRepository)
    public reservationRepository: ReservationRepository,
  ) { }

  @get('/reservations/{id}/event', {
    responses: {
      '200': {
        description: 'Event belonging to Reservation',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Event),
          },
        },
      },
    },
  })
  async getEvent(
    @param.path.string('id') id: typeof Reservation.prototype.id,
  ): Promise<Event> {
    return this.reservationRepository.event(id);
  }
}
