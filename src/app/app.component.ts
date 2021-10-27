import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// Amplify
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';

import { DataStore } from '@aws-amplify/datastore';
// import { Seat } from '../../amplify/backend/api/SaveASeatAPI/src/models';
import { Seat } from '../models';
import * as dfns from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: CognitoUserInterface | undefined;
  authState: AuthState | undefined;
  dataStore: any = DataStore;

  constructor(private ref: ChangeDetectorRef, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData as CognitoUserInterface;
      this.ref.detectChanges();

      console.log('1. authData', authData);
      console.log('2. this.user', this.user);
      console.log('3. authState', this.authState);

      if (this.authState === 'signedin' && this.user) {
        this.authService.userAuth(true);
        this.router.navigate(['/dashboard'])
      }
      else {
        this.authService.userAuth(false)
        this.router.navigate(['/login']);
      }
    });

  }

  ngOnDestroy() {
    return onAuthUIStateChange;
  }


  test() {
    console.log('datastore', this.dataStore.query(Seat));
    
  }

  postFunc() {
    this.dataStore.save(
      new Seat({
        "seatNumber": Math.floor(Math.random() * 200),
        "bookings": []
      })
    );
  }

  generateSeats() {
    console.log('GEN');
    for (let i = 1; i <= 20; i++) {
      console.log('generate seat', i);
      
      this.dataStore.save(
        new Seat({
          "seatNumber": i,
          "bookings": []
        })
      );
    }
  }

  generateBookings() {
    const numOfDays = Math.floor(Math.random() * 30);
    const startDate = dfns.addDays(new Date(), 1)
    for (let i = 1; i <= numOfDays; i++) {
      // dfns.addDays(, i)
    }
  }

  putFunc() {
    /* Models in DataStore are immutable. To update a record you must use the copyOf function
 to apply updates to the item’s fields rather than mutating the instance directly */

    // this.dataStore.save(Seat.copyOf(CURRENT_ITEM, item => {
      // Update the values on {item} variable to update DataStore entry
    // }));
  }

  deleteFunc() {
    const modelToDelete = this.dataStore.query(Seat, 123456789);
    DataStore.delete(modelToDelete);
  }

  getfunc() {
    const models = this.dataStore.query(Seat);
    console.log('get seats',models);
  }
}
