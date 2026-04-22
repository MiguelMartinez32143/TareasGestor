import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  admin: { id: number; username: string };
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

  // POST /login → guardar token, actualizar BehaviorSubject
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

  // Eliminar token, resetear BehaviorSubject
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    }
    this.loggedInSubject.next(false);
  }

  // Retorna boolean según existencia del token
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  // Retorna el token almacenado
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  // Retorna los datos del admin logueado
  getAdmin(): { id: number; username: string } | null {
    if (isPlatformBrowser(this.platformId)) {
      const admin = localStorage.getItem('admin');
      return admin ? JSON.parse(admin) : null;
    }
    return null;
  }

  // Editar perfil del admin logueado (username y/o password)
  editarPerfil(username?: string, password?: string): Observable<{ mensaje: string; admin?: { id: number; username: string } }> {
    const admin = this.getAdmin();
    if (!admin) {
      throw new Error('No hay sesión activa.');
    }

    const body: { username?: string; password?: string } = {};
    if (username) body.username = username;
    if (password) body.password = password;

    return this.http.put<{ mensaje: string; admin?: { id: number; username: string } }>(
      `${this.API_URL}/admins/${admin.id}`, body
    ).pipe(
      tap((res) => {
        // Si se actualizó el username, actualizar localStorage
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

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }
}

// ✅ RF/RNF cubiertos: [RF-A1, RF-A2, RNF-C2]
// ⚠️ CONFLICTO DETECTADO: Ninguno
