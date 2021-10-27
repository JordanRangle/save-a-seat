import { Injectable} from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './auth/user.model';

export interface User {
  email: string,
  id: string,
  token: string,
  tokenExpirationDate: Date
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isUserLoggedIn: boolean = false;
  authState = new Subject<boolean>();

  user = new Subject<User>();

  constructor(private http: HttpClient) {
    this.authState.subscribe((value) => {
      this.isUserLoggedIn = value
    });
  }

  userAuth(isAuth: boolean) {
    console.log('userAuthService', isAuth);

    this.authState.next(isAuth);
  }

  // --------------------------------------------------------------------
  // Old - ExpressJS calls
  userAuthenticate(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/users', {email, password})
  }

  userSignup(user:User): Observable<User> {
    console.log('user signup login service', user);
    
    return this.http.post<User>('http://localhost:3000/api/userSignup', user)
  }

  getUserBookings(userID: number): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/getUserBookings', {userID})
  }
}
