import { ActivatedRoute, Router } from '@angular/router';
import { SeatBookingService } from './../seat-booking.service';
// import { Seat, BookingInterface } from './../seat.interface';
import { AppDate } from './../appDate.interface';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as datefns from 'date-fns';
import { AppServiceService } from '../app-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// Amplify
import { DataStore } from '@aws-amplify/datastore';
import { Bookings, Seat } from '../../models';
import { ampSeat, BookingInterface } from '../seat.interface';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-seat-select',
  templateUrl: './seat-select.component.html',
  styleUrls: ['./seat-select.component.scss']
})
export class SeatSelectComponent implements OnInit {

  tomorrow: Date = datefns.addDays(new Date(), 1);
  selectedDate: any = { available:[], booked:[]};
  minDate = this.tomorrow;
  maxDate: Date = datefns.addDays(new Date(), 30)
  dates: AppDate[] = [];
  seats: Seat[] = [];
  errorMsg: string = '';
  showDateError: boolean = false;
  @ViewChild('confirmationDialog') confirmationDialogTemplate!: TemplateRef<any>;
  @ViewChild('updateDialog') updateDialogTemplate!: TemplateRef<any>;

  // edit booking
  editBooking: any = {};

  seatSelectForm = new FormGroup({
    date: new FormControl(this.tomorrow, Validators.required),
    seat: new FormControl(null, Validators.required),
  });


  //Amplify
  dataStore: any = DataStore;
  ampSeats: ampSeat[] = [];
  allBookings: BookingInterface[] = [];

  constructor(private service: AppServiceService, private seatBookingService: SeatBookingService, private dialog: MatDialog, private router: Router, private activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    // watch for edit booking params
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.date && params.seatNumber) {
        this.editBooking = params;
        const dateTime = new Date(params.date + 'T00:00:00');
        this.seatSelectForm.controls.date.setValue(dateTime);
      }
    });

    this.getSeats();
    this.getBookings();
  }

  // ****************************
  // Amplify Start
  // ****************************

  getSeats() {
    this.dataStore.query(Seat).then((seats: ampSeat[]) => {
      // any checks on the user if needed - not sure if AWS just throws an error if they are not logged in, or returns an object with information saying not logged in        
      this.ampSeats = seats.sort((a, b) => a.seatNumber > b.seatNumber ? 1 : -1);
    }).catch((err: any) => {
      console.log('Query Seats error', err);
    });
  }

  getBookings() {
    this.dataStore.query(Bookings).then((bookings: BookingInterface[]) => {
      this.allBookings = bookings;
    })
  }

  async postFunc() {
    await DataStore.save(new Seat({
      seatNumber: 1,
    }))
  }

  async postBooking() {
    if (!this.seatSelectForm.value.seat) return;
    
    Auth.currentAuthenticatedUser().then(user => {
      console.log('post booking', datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd'), this.seatSelectForm.value.seat.seatNumber, user.username);
      DataStore.save(new Bookings({
        date: datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd'),
        seat: this.seatSelectForm.value.seat.seatNumber,
        user: user.username
      }))
    })
  }

  async putFunc() {
    if (!this.seatSelectForm.value.seat) return;
    /* Models in DataStore are immutable. To update a record you must use the copyOf function
 to apply updates to the item’s fields rather than mutating the instance directly */

    Auth.currentAuthenticatedUser().then(user => {
      DataStore.save(Seat.copyOf(this.seatSelectForm.value.seat, item => {
        // item.bookings?.push({
        //   date: datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd'),
        //   user: user.username
        // })
      }));

      this.showConfirmDialog();
    })

    // this.dataStore.save(Seat.copyOf(this.seatSelectForm.value.seat, item => {
      // item.bookings?.push({date: datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd'), userID: })
    // }));

    // Auth.currentAuthenticatedUser().then(console.log);
  }

  async deleteFunc() {
    if (!this.seatSelectForm.value.seat) return;

    const modelToDelete:any = await DataStore.query(Seat, this.seatSelectForm.value.seat.id);
    DataStore.delete(modelToDelete);
  }

  getfunc() {
    const models = this.dataStore.query(Seat);
    console.log('get seats', models);
  }

  // ****************************
  // Amplify End
  // ****************************

  dateChange(event: any) {
    // reset date error    
    this.showDateError = false;
    // reset seat value
    this.seatSelectForm.controls.seat.reset();
    // if the date input is empty, default back to tomorrow
    if (this.seatSelectForm.value.date === null) {
      this.seatSelectForm.controls.date.setValue(this.tomorrow);
      
    }
    if (datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd') < datefns.format(this.minDate, 'yyyy-MM-dd') ||
      datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd') > datefns.format(this.maxDate, 'yyyy-MM-dd')) {
      this.showDateError = true;
    }
    else {
      // call end point if date is valid
      // this.getAvailableSeats(datefns.format(event.value, 'yyyy-MM-dd'));
    }    
  }

  seatChange(event: any) {
    console.log('seat change', event);
  }

  confirmBooking() {
    let data = {
      date: datefns.format(this.seatSelectForm.value.date, 'yyyy-MM-dd'),
      seat: this.seatSelectForm.value.seat.id,
      userID: sessionStorage.userID
    }
    this.errorMsg = '';
    this.seatBookingService.confirmBooking(data).subscribe((response: any) => {
      // show confirmation dialog
      this.showConfirmDialog();

      // TODO: include continue booking button
      // this.getAvailableSeats(data.date);

    }, (error: any) => {
      this.errorMsg = error.error;
    })
  }
  
  showConfirmDialog() {
    this.dialog.open(this.confirmationDialogTemplate);

    this.dialog.afterAllClosed.subscribe(() => {
      // re-direct back to dashboard
      this.router.navigate(['dashboard'])
    })
  }

  updateBooking() {
    console.log('update booking', this.seatSelectForm);
    // this.errorMsg = '';
    // this.seatBookingService.updateBooking(this.editBooking.date, sessionStorage.userID, this.editBooking.seat, this.seatSelectForm.value.seat.id,).subscribe((response: any) => {
    //   // show confirmation dialog
    //   this.showUpdateDialog();
    // }, (error: any) => {
    //   this.errorMsg = error.error;
    // })

    if (!this.seatSelectForm.value.seat) return;
    /* Models in DataStore are immutable. To update a record you must use the copyOf function
 to apply updates to the item’s fields rather than mutating the instance directly */

    let bookingToMove: Bookings;
    // let currentUser = "";
    Auth.currentAuthenticatedUser().then(user => {
      DataStore.save(Seat.copyOf(this.seatSelectForm.value.seat, item => {
        // const bookingIndex = item.bookings?.findIndex(booking => booking.date === datefns.format(this.editBooking.date, 'yyyy-MM-dd'));
        // if (item.bookings && bookingIndex) {
        //   bookingToMove = item.bookings?.splice(bookingIndex, 1)[0];
        // }
        })
      ).then(success => {
        this.ampSeats.forEach(seat => {
          if (seat.seatNumber === this.editBooking.seatNumber) {

            // DataStore.save(Seat.copyOf(seat, item => {
            //   item.bookings?.push(bookingToMove)
            // }))
          }
        });
      })
    });

    this.showUpdateDialog();
  }

  showUpdateDialog() {
    this.dialog.open(this.updateDialogTemplate);

    this.dialog.afterAllClosed.subscribe(() => {
      // re-direct back to dashboard
      this.router.navigate(['dashboard']);
    })
  }
}
