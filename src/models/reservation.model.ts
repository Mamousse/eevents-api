import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';
import {Event} from './event.model';

@model()

export class Reservation extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id?: string;
  @property({
    type: 'string',
    required: true,
  })
  nom: string;

  @property({
    type: 'string',
    required: true,
  })
  prenom: string;

  @property({
    type: 'string',
    required: true,
  })
  numeroWhatsapp: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'number',
    required: true,
  })
  nombrePlaces: number;

  @property({
    type: 'string',
    required: true,
  })
  modaliteEntree: string;

  @property({
    type: 'string',
    required: true,
  })
  modalitePaiement: string;

  @property({
    type: 'number',
    required: true,
  })
  montantTotal: number;

  @property({
    type: 'boolean',
    required: true,
  })
  estPaye: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  estValide: boolean;

  @property({
    type: 'date',
    required: true,
  })
  dateReservation: Date;

  @property({
    type: 'string',
  })
  commentaire?: string;

  @property({
    type: 'string',
  })
  qrCode?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  used?: boolean;

  @property({
    type: 'date',
  })
  dateUtilisation?: Date;

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Event)
  eventId: string;

  constructor(data?: Partial<Reservation>) {
    super(data);
  }
}



export interface ReservationRelations {
  // describe navigational properties here
}

export type ReservationWithRelations = Reservation & ReservationRelations;
