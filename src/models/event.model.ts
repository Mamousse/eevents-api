import {Entity, model, property, hasMany} from '@loopback/repository';
import {Reservation} from './reservation.model';

@model()
export class ModaliteEntree {
  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'number',
    required: true,
  })
  prix: number;

  @property({
    type: 'string',
  })
  description?: string;
}

@model()
export class ModalitePaiement {
  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
  })
  details?: string;
}

@model({
  settings: {
    strict: true,
  },
})
export class Event extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false, // ou true si auto-généré
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  nom: string;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'string',
    required: true,
  })
  emplacement: string;

  @property({
    type: 'number',
    required: true,
  })
  nombrePlacesDisponibles: number;

  @property({
    type: 'number',
  })
  nombrePlacesReservees?: number;

  @property.array(ModaliteEntree, {required: true})
  modalitesEntree: ModaliteEntree[];

  @property.array(ModalitePaiement, {required: true})
  modalitesPaiement: ModalitePaiement[];

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: Date;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  updatedAt?: Date;

  @property({
    type: 'string',
  })
  qrCodeUrl?: string;

  @property({
    type: 'string',
  })
  lienReservation?: string;

  @property.array(String)
  photos?: string[];

  @property({
    type: 'string',
  })
  flyerUrl?: string;

  @hasMany(() => Reservation)
  reservations: Reservation[];

  constructor(data?: Partial<Event>) {
    super(data);
  }
}

export interface EventRelations {
  // describe navigational properties here
}

export type EventWithRelations = Event & EventRelations;
