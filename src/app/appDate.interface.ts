import { Seat } from './seat.interface';

export interface AppDate {
    date: string,
    available: Seat[],
    booked: Seat[]
}