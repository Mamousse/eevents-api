import {Entity, hasMany, model, property} from '@loopback/repository';
import {Reservation} from './reservation.model';

@model({settings: {strict: false}})
export class User extends Entity {

  @property({
    type: 'string',
    id: true, // ✅ ceci est essentiel
    generated: true, // ✅ true si MongoDB ou auto-généré
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  prenom: string;

  @property({
    type: 'string',
    required: true,
  })
  nom: string;

  @property({
    type: 'string',
    required: true,
  })
  telephone: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    default: null,
  })
  email?: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: ['admin', 'user'], // 🎯 Enum LoopBack-compatible
    },
  })
  role: 'admin' | 'user';


  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: Date;

  @hasMany(() => Reservation)
  reservations: Reservation[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
