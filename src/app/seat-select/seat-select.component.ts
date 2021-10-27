import { ActivatedRoute, Router } from '@angular/router';
import { SeatBookingService } from './../seat-booking.service';
// import { Seat } from './../seat.interface';
import { AppDate } from './../appDate.interface';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import * as datefns from 'date-fns';
import { AppServiceService } from '../app-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
// Amplify
import { DataStore } from '@aws-amplify/datastore';
import { Seat } from '../../models';

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

  constructor(private service: AppServiceService, private seatBookingService: SeatBookingService, private dialog: MatDialog, private router: Router, private activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    // Generate fake data for the DB
    // this.generateDates();
    
    // watch for edit booking params
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        console.log(params);
        this.editBooking = params;
        const dateTime = params.date + 'T00:00:00';
        this.seatSelectForm.controls.date.setValue(dateTime);
        // this.seatSelectForm.controls.seat.setValue(parseInt(params.seat));
        this.getAvailableSeats(params.date);
      }
      else {
        this.getAvailableSeats(datefns.format(this.tomorrow, 'yyyy-MM-dd'));
      }
    });
  }

  getAvailableSeats(date: string) {  
    this.errorMsg = '';
    this.seatBookingService.getAvailableSeats(date).subscribe((success) => {
      this.selectedDate = success;
    }, (error) => {
      this.errorMsg = error.error;
    });
  }

  getDates() {
    this.errorMsg = '';
    this.service.getDates().subscribe((response: any) => {
      this.dates = response.data;

    }, (error: any) => {
      this.errorMsg = error.error;
    })
  }

  // Temp until dates DB is created
  generateSeats() {
    let tmpAvailSeats = [];
    let tmpBookedSeats = [];

    // create all available seats
    for (let i = 1; i <= 20; i++) {
      tmpAvailSeats.push({
        id: i,
        name: `Seat #${i}`,
        seat: i,
        userID: 0
      });
    }    
    // randomly move seats to the booked array
    const numOfBookedSeats = Math.floor(Math.random() * 20);
    for (let i = 0; i < numOfBookedSeats; i++) {
      let randomSeat = Math.floor(Math.random() * (tmpAvailSeats.length - 1));
      tmpAvailSeats[randomSeat].userID = Math.floor(Math.random() * 150);
      tmpBookedSeats.push(tmpAvailSeats.splice(randomSeat, 1)[0]);
    }

    tmpBookedSeats.sort((a, b) => a.id > b.id ? 1 : -1);
    return { tmpAvailSeats, tmpBookedSeats };
  }

  // Temp until dates DB is created
  generateDates() {
    for (let i = 0; i < 30; i++) {
      const tmpSeats = this.generateSeats();
      const tmpDate = datefns.addDays(this.tomorrow, i)
      this.dates.push({
        date: datefns.format(tmpDate, 'yyyy-MM-dd'),
        available: tmpSeats.tmpAvailSeats,
        booked: tmpSeats.tmpBookedSeats
      });
    }
    console.log('generateDates()', this.dates);
  }

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
      this.getAvailableSeats(datefns.format(event.value, 'yyyy-MM-dd'));
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
    this.errorMsg = '';
    this.seatBookingService.updateBooking(this.editBooking.date, sessionStorage.userID, this.editBooking.seat, this.seatSelectForm.value.seat.id,).subscribe((response: any) => {
      // show confirmation dialog
      this.showUpdateDialog();
    }, (error: any) => {
      this.errorMsg = error.error;
    })
  }

  showUpdateDialog() {
    this.dialog.open(this.updateDialogTemplate);

    this.dialog.afterAllClosed.subscribe(() => {
      // re-direct back to dashboard
      this.router.navigate(['dashboard']);
    })
  }
  
  // Amplify
  getGQL() {
    const models = this.dataStore.query(Seat);
    console.log('get seats', models);
  }
  

}
