import { CognitoUserInterface } from '@aws-amplify/ui-components';
import { Injectable} from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserModel } from './auth/user.model';
import { Auth } from 'aws-amplify';

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
  authState = new BehaviorSubject(false);

  user = new Subject<CognitoUserInterface>();

  constructor(private http: HttpClient) {
    this.authState.subscribe((value) => {
      this.isUserLoggedIn = value
    });
  }

  userAuth(isAuth: boolean) {
    // console.log('userAuthService', isAuth);
    this.authState.next(isAuth);
  }

  userAuthCheck() {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        // any checks on the user if needed - not sure if AWS just throws an error if they are not logged in, or returns an object with information saying not logged in        
        this.authState.next(true);
      }).catch(err => {
        console.log(err);
        this.authState.next(false);
      });
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
