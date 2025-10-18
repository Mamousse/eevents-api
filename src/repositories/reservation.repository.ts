import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {EeventDataSource} from '../datasources';
import {Reservation, ReservationRelations, User, Event} from '../models';
import {UserRepository} from './user.repository';
import {EventRepository} from './event.repository';

export class ReservationRepository extends DefaultCrudRepository<
  Reservation,
  typeof Reservation.prototype.id,
  ReservationRelations
> {

  public readonly user: BelongsToAccessor<User, typeof Reservation.prototype.id>;

  public readonly event: BelongsToAccessor<Event, typeof Reservation.prototype.id>;

  constructor(
    @inject('datasources.eevent') dataSource: EeventDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('EventRepository') protected eventRepositoryGetter: Getter<EventRepository>,
  ) {
    super(Reservation, dataSource);
    this.event = this.createBelongsToAccessorFor('event', eventRepositoryGetter,);
    this.registerInclusionResolver('event', this.event.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
