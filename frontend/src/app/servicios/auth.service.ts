import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  admin: { id: number; username: string };
}

interface Admin {
  id: number;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly API_URL = environment.apiUrl;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  // POST /login
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { username, password }).pipe(
      tap((res) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('admin', JSON.stringify(res.admin));
        }
        this.loggedInSubject.next(true);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    }
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getAdmin(): Admin | null {
    if (isPlatformBrowser(this.platformId)) {
      const admin = localStorage.getItem('admin');
      return admin ? JSON.parse(admin) : null;
    }
    return null;
  }

  // Editar perfil del admin logueado
  editarPerfil(username?: string, password?: string): Observable<{ mensaje: string; admin?: Admin }> {
    const admin = this.getAdmin();
    if (!admin) {
      throw new Error('No hay sesión activa.');
    }

    const body: { username?: string; password?: string } = {};
    if (username) body.username = username;
    if (password) body.password = password;

    return this.http.put<{ mensaje: string; admin?: Admin }>(
      `${this.API_URL}/admins/${admin.id}`, body
    ).pipe(
      tap((res) => {
        if (res.admin && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('admin', JSON.stringify(res.admin));
        }
      })
    );
  }

  // Crear nuevo administrador
  crearAdmin(username: string, password: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API_URL}/admins`, { username, password });
  }

  // Listar todos los administradores
  listarAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.API_URL}/admins`);
  }

  // Editar un administrador por ID
  editarAdmin(id: number, username?: string, password?: string): Observable<{ mensaje: string; admin?: Admin }> {
    const body: { username?: string; password?: string } = {};
    if (username) body.username = username;
    if (password) body.password = password;

    return this.http.put<{ mensaje: string; admin?: Admin }>(
      `${this.API_URL}/admins/${id}`, body
    );
  }

  // Eliminar administrador
  eliminarAdmin(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.API_URL}/admins/${id}`);
  }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }
}
