import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
// Amplify
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';
import { Hub } from 'aws-amplify';
import { HubPayload } from '@aws-amplify/core';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  title = 'Save a Seat';
  isUserLoggedIn: any = false;
  
  user: any;

  private userSub!: Subscription;
  isAuthenticated: boolean = false;
  // test
  private authState!: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    Hub.listen('auth', (data) => {
      const { payload } = data;
      this.onAuthEvent(payload);
      // console.log('A new auth event has happened: ', data.payload.data.username + ' has ' + data.payload.event);
    });
  }

  ngOnInit(): void {
    // subscribe to "user" in auth service
    this.userSub = this.authService.user.subscribe(user => {
      // this.isAuthenticated = !user ? false : true;
      this.isAuthenticated = !!user;
      console.log('isAuthenticated', this.isAuthenticated);
      
    })

    // test
    this.authState = this.authService.authState.subscribe(state => {
      this.isAuthenticated = state;
    });
    // test end
  }

  onAuthEvent(payload:HubPayload) {
    // ... your implementation
    console.log('*** app-header onAuthEvent ***', payload);
    
  }

  logout() { 
    this.isUserLoggedIn = false;
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();

    this.authState.unsubscribe();
  }
}
