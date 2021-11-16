export interface Seat {
    id: number,
    name: string,
    seat: number
}

export interface ampSeat {
    id: string,
    seatNumber: number,
    bookings: any,
    createdAt: string,
    updatedAt: string,
    _deleted?: any,
    _lastChangedAt: number,
    _version: number
}

export interface BookingInterface {
    // readonly id: string;
    date: string,
    user: string,
    seat: number,
    // readonly createdAt?: string;
    // readonly updatedAt?: string;
}