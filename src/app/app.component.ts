import { AuthService } from './auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
// Amplify
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';

import { DataStore } from '@aws-amplify/datastore';
// import { Seat } from '../../amplify/backend/api/SaveASeatAPI/src/models';
import { Seat } from '../models';
import * as dfns from 'date-fns';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user: CognitoUserInterface | undefined;
  authState: AuthState | undefined;
  dataStore: any = DataStore;

  constructor(private ref: ChangeDetectorRef, private router: Router, private authService: AuthService, private route: ActivatedRoute) {
    console.log('current route =====> ', route);
  }

  ngOnInit() {
    // check if user is logged in
    // const currentUser: any = Auth.currentAuthenticatedUser();
    // console.log('ngOnInit currentAuthenticatedUser', currentUser);
    // if (currentUser.__zone_symbol__state === 1) {
    //   this.authService.userAuth(true)
    // }
    // else {      
    //   this.authService.userAuth(false)
    // }
    this.authService.userAuthCheck();

    // watch for user state change
    onAuthUIStateChange((authState, authData) => {
      this.authState = authState;
      this.user = authData as CognitoUserInterface;
      this.ref.detectChanges();

      // console.log('1. authData', authData);
      // console.log('2. this.user', this.user);
      // console.log('3. authState', this.authState);

      if (this.authState === 'signedin' && this.user) {
        if (window.location.pathname === '/login') {
          this.router.navigate(['/dashboard'])
        }
        this.authService.userAuth(true);
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

  generateSeats() {
    for (let i = 1; i <= 20; i++) {
      console.log('generate seat', i);
      
      this.dataStore.save(
        new Seat({
          "seatNumber": i,
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
}
