import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type SeatMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Seat {
  readonly id: string;
  readonly seatNumber: number;
  readonly bookings?: string[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Seat, SeatMetaData>);
  static copyOf(source: Seat, mutator: (draft: MutableModel<Seat, SeatMetaData>) => MutableModel<Seat, SeatMetaData> | void): Seat;
}