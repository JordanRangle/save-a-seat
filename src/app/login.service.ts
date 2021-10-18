import { Injectable} from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// create interface
export interface User {
  id: number,
  email: string,
  password: string,
  firstName: string,
  lastName: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isUserLoggedIn: boolean = false;
  userLoggedInChange: Subject<boolean> = new Subject<boolean>();


  constructor(private http: HttpClient) {
    this.userLoggedInChange.subscribe((value) => {
      this.isUserLoggedIn = value
    });
  }

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

  authEmit(loggedIn: boolean) {
    console.log('AuthEmit', loggedIn);
    
    return of(loggedIn);
    // return loggedIn;
  }

  userAuth(loggedIn: boolean) {
    console.log('userAuth', loggedIn);
    
    this.userLoggedInChange.next(loggedIn);
  }
}
