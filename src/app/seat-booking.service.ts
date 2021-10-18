import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SeatBookingService {

  constructor(private http: HttpClient) { }

  getAvailableSeats(date: string): Observable<any> {
    return this.http.get<any>('http://localhost:3000/api/date/' + date)
  }

  confirmBooking(data: any): Observable<any> {
    // return this.http.put('/api/getDates');
    return this.http.post('http://localhost:3000/api/confirmBooking', data)
  }

  cancelBooking(date: string, id: number): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/cancelBooking', { date, id })
  }

  updateBooking(date: string, userID: number, oldSeat: number, newSeat: number) {
    return this.http.put<any>('http://localhost:3000/api/updateBooking', {date, userID, oldSeat, newSeat})
  }
}
