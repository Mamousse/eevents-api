import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {EeventDataSource} from '../datasources';
import {Event, EventRelations, Reservation} from '../models';
import {ReservationRepository} from './reservation.repository';

export class EventRepository extends DefaultCrudRepository<
  Event,
  typeof Event.prototype.id,
  EventRelations
> {

  public readonly reservations: HasManyRepositoryFactory<Reservation, typeof Event.prototype.id>;

  constructor(
    @inject('datasources.eevent') dataSource: EeventDataSource, @repository.getter('ReservationRepository') protected reservationRepositoryGetter: Getter<ReservationRepository>,
  ) {
    super(Event, dataSource);
    this.reservations = this.createHasManyRepositoryFactoryFor('reservations', reservationRepositoryGetter,);
    this.registerInclusionResolver('reservations', this.reservations.inclusionResolver);
  }
}
