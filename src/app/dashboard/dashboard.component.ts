import { SeatBookingService } from './../seat-booking.service';
import { Router } from '@angular/router';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AppDate } from '../appDate.interface';
import { Booking } from '../booking.interface';
import * as datefns from 'date-fns';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private authService: AuthService, private router: Router, private seatBookingService: SeatBookingService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getUserBookings();

    // fake bookings data
    // for (let i = 1; i < 4; i++) {
    //   this.bookings.push({
    //     id: i,
    //     date: datefns.format(datefns.addDays(new Date(), i * 3), 'yyyy-MM-dd'),
    //     seat: Math.floor(Math.random() * 30)
    //   })
    // }
  }

  getUserBookings() {
    if (!sessionStorage.userID) {
      // can't find user ID - redirect back to login
      this.router.navigate(['login']);
    }
    else {
      this.authService.getUserBookings(sessionStorage.userID).subscribe(res => {
        sessionStorage.setItem('bookings', JSON.stringify(res));
        this.bookings = res;
      }, error => {
        console.log('getUser error', error.error);
      });
    }
  }

  editBooking(booking:any) {
    this.router.navigate(['seat-select', booking]);
  }

  cancelBooking(booking:any) {
    this.seatBookingService.cancelBooking(booking.date, booking.id).subscribe(res => {
      this.getUserBookings();
    }, error => {
      console.log('cancel booking error', error);
    })
  }

  showCancelDialog(booking: Booking) {
    const dialogRef = this.dialog.open(this.cancelDialogTemplate);

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.cancelBooking(booking);
      }
    });
  }

  // declineCancel(): void {
  //   this.dialog.close(this.cancelDialogTemplate);
  //   this.cancelDialogTemplate.close();
  // }

  // confirmCancel(): void {
  //   this.cancelDialogTemplate.show();
  // }

}
