import { Seat } from './../seat.interface';
import { AppDate } from './../appDate.interface';
import { Component, OnInit } from '@angular/core';
import * as datefns from 'date-fns';
// import { Express } from 'express';

@Component({
  selector: 'app-seat-select',
  templateUrl: './seat-select.component.html',
  styleUrls: ['./seat-select.component.less']
})
export class SeatSelectComponent implements OnInit {

  tomorrow: Date = datefns.addDays(new Date(), 1);
  selectedDate = this.tomorrow;
  minDate = this.tomorrow;
  maxDate: Date = datefns.addDays(new Date(), 30)
  dates: AppDate[] = [];

  //express
  // express = require('express');
  // expApp = this.express();
  // port: number = 3000;

  constructor() { }
  
  ngOnInit(): void {
    this.generateDates();
    // this.generateSeats();

    // this.expApp.get('/', (req: any, res: { send: (arg0: string, arg1: any, arg2: any) => void; }) => {
    //   const req1 = req;
    //   const res1 = res;
    //   res.send('Hello World!', req, res);
    // })
  
    // this.expApp.listen(this.port, () => {
    //   console.log(`Example app listening at http://localhost:${this.port}`)
    // })
  }

  generateSeats() {
    let tmpAvailSeats = [];
    let tmpBookedSeats = [];

    // create all available seats
    for (let i = 1; i <= 20; i++) {
      tmpAvailSeats.push({
        id: i,
        name: `Seat #${i}`
      });
    }
    // randomly move seats to the booked array
    const numOfBookedSeats = Math.floor(Math.random() * 20);
    for (let i = 0; i < numOfBookedSeats; i++) {
      let randomSeat = Math.floor(Math.random() * (tmpAvailSeats.length - 1));
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
  }

  dateChange(event: any) {
    this.selectedDate = event.value;
  }

  bookSeat(selectedSeat:Seat) {    
    const selectedDateIndex = this.dates.findIndex(date => {
      const dateFormat = datefns.format(this.selectedDate, 'yyyy-MM-dd');
      return date.date === dateFormat;
    })

    // find and remove seat from available array
    const seatToBookIndex = this.dates[selectedDateIndex].available.findIndex(seat => {
      return seat === selectedSeat;
    });
    this.dates[selectedDateIndex].available.splice(seatToBookIndex, 1);

    // push to booked array
    this.dates[selectedDateIndex].booked.push(selectedSeat);
    this.dates[selectedDateIndex].booked.sort((a, b) => a.id > b.id ? 1 : -1);
  }

  cancelSeat(selectedSeat:Seat) {
    const selectedDateIndex = this.dates.findIndex(date => {
      const dateFormat = datefns.format(this.selectedDate, 'yyyy-MM-dd');
      return date.date === dateFormat;
    })

    // find and remove seat from booked array
    const seatToCancelIndex = this.dates[selectedDateIndex].booked.findIndex(seat => {
      return seat === selectedSeat;
    });
    this.dates[selectedDateIndex].booked.splice(seatToCancelIndex, 1);

    // push to available array
    this.dates[selectedDateIndex].available.push(selectedSeat);
    this.dates[selectedDateIndex].available.sort((a, b) => a.id > b.id ? 1 : -1);
  }

}
