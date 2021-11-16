import { DataStore } from '@aws-amplify/datastore';
import { SeatBookingService } from './../seat-booking.service';
import { Router } from '@angular/router';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AppDate } from '../appDate.interface';
import { Booking } from '../booking.interface';
import * as datefns from 'date-fns';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Seat, Bookings } from 'src/models';
import { ampSeat, BookingInterface } from '../seat.interface';
import Auth from '@aws-amplify/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  username: string = '';
  userDates: AppDate[] = [];
  bookings: Booking[] = [];
  @ViewChild('cancelDialog') cancelDialogTemplate!: TemplateRef<any>;
  bookingToCancel!: Booking; 

  //Amplify
  dataStore = DataStore;
  ampSeats: Seat[] = [];
  myBookings: any = [];
  currentUser: any = '';

  constructor(private authService: AuthService, private router: Router, private seatBookingService: SeatBookingService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getUser();

    // BELOW OLD CODE
    // this.getUserBookings();

    // fake bookings data
    // for (let i = 1; i < 4; i++) {
    //   this.bookings.push({
    //     id: i,
    //     date: datefns.format(datefns.addDays(new Date(), i * 3), 'yyyy-MM-dd'),
    //     seat: Math.floor(Math.random() * 30)
    //   })
    // }
  }

  getUser() {
    Auth.currentAuthenticatedUser().then(user => {
      this.currentUser = user.username;
      // this.getSeats();
      this.getBookings();
    });
  }

  async getSeats() {
    await DataStore.query(Seat).then(seats => {
      this.ampSeats = seats.sort((a, b) => a.seatNumber > b.seatNumber ? 1 : -1);

    }).catch((err: any) => {
      console.log('Query Seats error', err);
    });
  }

  getBookings() {
    this.dataStore.query(Bookings).then((bookings: BookingInterface[]) => {
      
      this.myBookings = bookings.filter(booking => booking.user === this.currentUser);
      console.log('my bookings', this.myBookings);
    })
  }

  editBooking(booking:any) {
    this.router.navigate(['seat-select', booking]);
  }

  cancelBooking(booking:any) {
    this.seatBookingService.cancelBooking(booking.date, booking.id).subscribe(res => {
      this.getBookings();
    }, error => {
      console.log('cancel booking error', error);
    })
  }

  async deleteFunc(booking: BookingInterface) {
    // const modelToDelete: any = await DataStore.query(Bookings, booking);
    // DataStore.delete(modelToDelete);
  }

  showCancelDialog(booking: Booking) {
    const dialogRef = this.dialog.open(this.cancelDialogTemplate);

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.cancelBooking(booking);
      }
    });
  }
}
