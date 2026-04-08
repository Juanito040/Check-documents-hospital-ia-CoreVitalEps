import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError, of, filter, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/api-response.model';
import { User, CreateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private userLoaded = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token) {
      // Restaurar usuario completo desde localStorage (incluye nombre)
      const saved = this.getSavedUser();
      if (saved) {
        this.currentUserSubject.next(saved);
      } else {
        const fromToken = this.decodeToken(token);
        if (fromToken) {
          this.currentUserSubject.next(fromToken as User);
        }
      }
      this.userLoaded.next(true);

      // Actualizar con datos frescos del backend en segundo plano
      this.loadCurrentUser().subscribe({
        error: (err) => {
          if (err.status === 401) {
            this.logout();
          }
        }
      });
    } else {
      this.userLoaded.next(true);
    }
  }

  // Base64URL → Base64 estándar → JSON
  private decodeToken(token: string): Partial<User> | null {
    try {
      const part = token.split('.')[1];
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const decoded = JSON.parse(atob(padded));
      return {
        id: decoded.sub,
        email: decoded.email,
        rol: decoded.rol
      };
    } catch {
      return null;
    }
  }

  // Observable que espera a que el usuario esté cargado antes de resolver
  isReady$(): Observable<boolean> {
    return this.userLoaded.pipe(
      filter(loaded => loaded),
      take(1),
      map(() => !!this.getToken())
    );
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.access_token);
        this.loadCurrentUser().subscribe({
          next: () => this.userLoaded.next(true)
        });
      })
    );
  }

  register(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data);
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  private getSavedUser(): User | null {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.userLoaded.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.rol === 'admin';
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
