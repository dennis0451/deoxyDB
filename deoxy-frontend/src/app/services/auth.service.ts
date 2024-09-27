import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api.service';
import { jwtDecode } from "jwt-decode";

//userinfo interface
export interface UserInfo {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn = false;
  public userInfo?: UserInfo;

  constructor(private http: HttpClient, private router: Router, private apiService: ApiService) {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.setUserInfoFromToken(token);
    } else {
      this.logout();
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.apiService.login(credentials).pipe(map((response: any) => {
      if (response.token) {
        this.isLoggedIn = true;
        this.setUserInfoFromToken(response.token);
        localStorage.setItem('token', response.token);
      }
      return response;
    }));
  }

  register(user: { username: string; email: string; password: string }): Observable<any> {
    return this.apiService.register(user).pipe(map((response: any) => {
      return response;
    }));
  }

  logout() {
    this.isLoggedIn = false;
    this.userInfo = undefined;
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    // Check if the token exists and is valid
    const token = localStorage.getItem('token');
    return !!token; // Returns true if a token exists, otherwise false
  }

  private setUserInfoFromToken(token: string) {
    try {
      const payload = this.decodeToken(token);
      this.userInfo = {
        id: payload.user_id,
        username: payload.username,
        email: payload.email,
      };
    } catch (e) {
      console.error('Invalid token', e);
      this.logout();
    }
  }

  private decodeToken(token: string): any {
    try {
      //decode the token to get its payload
      return jwtDecode(token);
      ;
    } catch (e) {
      throw new Error('Invalid token');
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return false;
    }
    const expiryDate = new Date(0);
    expiryDate.setUTCSeconds(payload.exp);
    return expiryDate < new Date(); // True if expired
  }

  getUserInfo() {
    return this.userInfo;
  }
}
