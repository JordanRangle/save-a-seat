import { Router } from '@angular/router';
import { AuthService } from './../login.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent implements OnInit {
  title = 'Save a Seat';
  isUserLoggedIn: any = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (sessionStorage.userID && sessionStorage.userID > 0) {
      this.isUserLoggedIn = true;
    }
    this.authService.userLoggedInChange.subscribe(value => {
      this.isUserLoggedIn = value
    });
  }

  logout() { 
    this.isUserLoggedIn = false;
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
