import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Component, Input, NgZone, OnDestroy, OnInit, ɵisListLikeIterable } from '@angular/core';
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
  authSub: Subscription;

  constructor(private authService: AuthService, private router: Router) {
    this.authSub = this.authService.authState.subscribe(val => {
      this.isAuthenticated = val;
      // console.log('Is in angular zone?', NgZone.isInAngularZone())
    });
  }

  ngOnInit(): void {}

  logout() { 
    this.isAuthenticated = false;
    // sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    // this.userSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
