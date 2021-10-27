import { User } from '../auth.service';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router, NavigationStart } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Amplify
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  userAuth: boolean = true; // should be based off API response
  isLoginMode: boolean = true;
  loginError: string = '';
  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  signupForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required)
  });

  @Output() userLoggedIn = new EventEmitter<Event>();

  user: CognitoUserInterface | undefined;
  authState: AuthState | undefined;


  constructor(private authService: AuthService, private router: Router, private ref: ChangeDetectorRef) { }

  ngOnInit(): void {    
    // onAuthUIStateChange((authState, authData) => {
    //   this.authState = authState;
    //   this.user = authData as CognitoUserInterface;
    //   this.ref.detectChanges();
    // });
    console.log('TESTTESTTEST', this.authState);
    
  }

  ngOnDestroy() {
    return onAuthUIStateChange;
  }


  // ******************************
  // ***** original auth start
  // ******************************

  // showSignup() {
  //   this.isLoginMode = false;
  // }

  // showLogin() {
  //   this.isLoginMode = true;
  // }

  // userLogin() {
  //   this.loginError = '';

  //   this.authService.userAuthenticate(this.loginForm.controls.email.value, this.loginForm.controls.password.value ).subscribe((response: any) => {
  //     sessionStorage.setItem('userID', response.id);
  //     sessionStorage.setItem('bookings', JSON.stringify(response.bookings));

  //     this.loginForm.reset();

  //     this.router.navigate(['dashboard']);
  //   }, (error: any) => {
  //     this.loginError = error.error;
  //   })
  // }

  // userSignup() {
  //   this.loginError = '';
  //   const newUser: User = {
  //     firstName: this.signupForm.controls.firstName.value,
  //     lastName: this.signupForm.controls.lastName.value,
  //     email: this.signupForm.controls.email.value,
  //     password: this.signupForm.controls.password.value,
  //     id: 0
  //   }

  //   this.authService.userSignup(newUser).subscribe((response: any) => {
  //     console.log('response from userSignup ', response);
  //     this.router.navigate(['/dashboard']);
  //   }, (error: any) => {
  //     console.log('userSignup error', error);
  //     this.loginError = error.error;
  //   })
  // }

  onSwitchMode() {
    this.userAuth = !this.userAuth;
  }

  // ******************************
  // ***** original auth end
  // ******************************
}
