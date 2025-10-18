import { Injectable, inject, signal } from '@angular/core';
import { CredentialsDto } from '../dto/credentials.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../config/api.config';
import { Observable } from 'rxjs';

export interface AuthUser {
  id: string | null;
  email: string | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Signal pour l'état utilisateur
  userSignal = signal<AuthUser>({
    id: null,
    email: null,
    isAuthenticated: false,
  });

  constructor() {
    this.reloadUserState();
  }

  login(credentials: CredentialsDto): Observable<LoginResponseDto> {
    return new Observable(observer => {
      this.http.post<LoginResponseDto>(API.login, credentials).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.id);
          localStorage.setItem('userId', response.userId.toString());
          localStorage.setItem('email', credentials.email);
          this.userSignal.set({
            id: response.userId.toString(),
            email: credentials.email,
            isAuthenticated: true,
          });
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  isAuthenticated(): boolean {
    return this.userSignal().isAuthenticated;
  }

  getUserEmail(): string | null {
    return this.userSignal().email;
  }

  getUserId(): string | null {
    return this.userSignal().id;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    this.userSignal.set({
      id: null,
      email: null,
      isAuthenticated: false,
    });
  }

  reloadUserState() {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('userId');
    const email = localStorage.getItem('email');
    this.userSignal.set({
      id: id,
      email: email,
      isAuthenticated: !!token,
    });
  }
}
