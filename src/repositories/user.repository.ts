import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {EeventDataSource} from '../datasources';
import {User, UserRelations, Reservation} from '../models';
import {ReservationRepository} from './reservation.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly reservations: HasManyRepositoryFactory<Reservation, typeof User.prototype.id>;

  constructor(
    @inject('datasources.eevent') dataSource: EeventDataSource, @repository.getter('ReservationRepository') protected reservationRepositoryGetter: Getter<ReservationRepository>,
  ) {
    super(User, dataSource);
    this.reservations = this.createHasManyRepositoryFactoryFor('reservations', reservationRepositoryGetter,);
    this.registerInclusionResolver('reservations', this.reservations.inclusionResolver);
  }
}
