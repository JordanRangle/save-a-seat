import { Pipe, PipeTransform } from "@angular/core";
import { ampSeat, BookingInterface } from "../seat.interface";
import * as dfns from "date-fns"

@Pipe({name: 'seatFilter'})
export class SeatFilterPipe implements PipeTransform {
    transform(seats: ampSeat[], bookings: BookingInterface[], date: Date): ampSeat[] {
        // if (!date) return [];

        // console.log('PIPE: ', seats, date);
        seats = [...seats.filter(seat => 
            !bookings.filter(booking => booking.date === dfns.format(date, 'yyyy-MM-dd') && booking.seat === seat.seatNumber).length
        )]
        return seats;
    }
}

@Pipe({name: 'hideBookedSeat'})
export class HideBookedSeatPipe implements PipeTransform {
    transform(seats: ampSeat[], seatNum: number): ampSeat[] {
        seats = [...seats.filter(seat => seat.seatNumber != seatNum)]
        return seats
    }
}