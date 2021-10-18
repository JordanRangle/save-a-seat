import { User } from './../login.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../login.service';
import { Router, NavigationStart } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AppHeaderComponent } from '../app-header/app-header.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userAuth: boolean = true; // should be based off API response
  signup: boolean = false;
  loginError: string = '';
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  signupForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl('')
  });

  @Output() userLoggedIn = new EventEmitter<Event>();


  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  showSignup() {
    this.signup = true;
  }

  showLogin() {
    this.signup = false;
  }

  testLogin() {
    // this.authService.authEmit(true);
    this.authService.userAuth(true);
  }

  userLogin() {
    this.loginError = '';

    this.authService.userAuthenticate(this.loginForm.controls.email.value, this.loginForm.controls.password.value ).subscribe((response: any) => {
      sessionStorage.setItem('userID', response.id);
      sessionStorage.setItem('bookings', JSON.stringify(response.bookings));
  
      //emit successful login
      // this.authService.authEmit(true);
      this.authService.userAuth(true);

      this.router.navigate(['dashboard']);
    }, (error: any) => {
      this.loginError = error.error;
    })
  }

  userSignup() {
    this.loginError = '';
    const newUser: User = {
      firstName: this.signupForm.controls.firstName.value,
      lastName: this.signupForm.controls.lastName.value,
      email: this.signupForm.controls.email.value,
      password: this.signupForm.controls.password.value,
      id: 0
    }

    this.authService.userSignup(newUser).subscribe((response: any) => {
      console.log('response from userSignup ', response);
      this.router.navigate(['/dashboard']);
    }, (error: any) => {
      console.log('userSignup error', error);
      this.loginError = error.error;
    })

  }
}
