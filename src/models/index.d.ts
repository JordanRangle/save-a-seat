import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type BookingsMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type SeatMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Bookings {
  readonly id: string;
  readonly date: string;
  readonly user: string;
  readonly seat: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Bookings, BookingsMetaData>);
  static copyOf(source: Bookings, mutator: (draft: MutableModel<Bookings, BookingsMetaData>) => MutableModel<Bookings, BookingsMetaData> | void): Bookings;
}

export declare class Seat {
  readonly id: string;
  readonly seatNumber: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Seat, SeatMetaData>);
  static copyOf(source: Seat, mutator: (draft: MutableModel<Seat, SeatMetaData>) => MutableModel<Seat, SeatMetaData> | void): Seat;
}