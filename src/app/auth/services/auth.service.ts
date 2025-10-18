import { Injectable, inject, signal } from '@angular/core';
import { CredentialsDto } from '../dto/credentials.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegisterDto } from '../dto/register.dto';
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

  /**
   * Get all locally registered users (for development purposes)
   */
  getRegisteredUsers(): any[] {
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  }

  /**
   * Clear all locally registered users (for development purposes)
   */
  clearRegisteredUsers(): void {
    localStorage.removeItem('registeredUsers');
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

  /**
   * Register a new user
   * @param registerData User registration data
   * @returns Observable with registration response
   */
  register(registerData: RegisterDto): Observable<any> {
    return new Observable(observer => {
      console.log('Attempting registration with data:', registerData);
      
      // Since the API doesn't have a registration endpoint, we'll simulate it
      // First, let's try the actual API endpoint
      this.http.post<any>(API.register, registerData).subscribe({
        next: (response) => {
          console.log('Registration successful via API:', response);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          console.error('API registration failed:', err);
          
          // If API fails (404), simulate local registration
          if (err.status === 404) {
            console.log('API endpoint not found, simulating local registration...');
            
            // Simulate registration process
            setTimeout(() => {
              // Check if email already exists in localStorage
              const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
              const emailExists = existingUsers.some((user: any) => user.email === registerData.email);
              
              if (emailExists) {
                observer.error({
                  status: 409,
                  error: { message: 'Email already exists. Please use a different email address.' }
                });
                return;
              }
              
              // Add new user to local storage
              const newUser = {
                id: Date.now().toString(),
                email: registerData.email,
                firstname: registerData.firstname,
                name: registerData.name,
                registeredAt: new Date().toISOString()
              };
              
              existingUsers.push(newUser);
              localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
              
              // Simulate successful response
              const mockResponse = {
                message: 'Registration successful! You can now log in with your credentials.',
                userId: newUser.id,
                email: newUser.email
              };
              
              console.log('Local registration successful:', mockResponse);
              console.log('All registered users:', existingUsers);
              observer.next(mockResponse);
              observer.complete();
            }, 1000); // Simulate network delay
          } else {
            // For other errors, pass them through
            observer.error(err);
          }
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
