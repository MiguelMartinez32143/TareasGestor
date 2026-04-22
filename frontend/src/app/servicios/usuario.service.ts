import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuarios } from '../components/usuario/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);

  // Angular Signal para reactividad global (RF-07)
  private _usuarios = signal<Usuarios[]>([]);

  // Signal de solo lectura para los componentes
  readonly usuarios = this._usuarios.asReadonly();

  // Signal computada: indica si hay datos cargados
  readonly cargando = signal<boolean>(true);

  // Signal: catálogo de avatares disponibles
  readonly avatares = signal<string[]>([]);

  constructor() {
    this.cargarUsuarios();
    this.cargarAvatares();
  }

  // GET: Cargar todos los usuarios desde el backend
  cargarUsuarios(): void {
    this.cargando.set(true);
    this.http.get<Usuarios[]>(`${this.API_URL}/usuarios`).subscribe({
      next: (datos) => {
        this._usuarios.set(datos);
        this.cargando.set(false);
      },
      error: (e) => {
        console.error('Error al cargar usuarios:', e);
        this.cargando.set(false);
      }
    });
  }

  // GET: Cargar catálogo de avatares
  private cargarAvatares(): void {
    this.http.get<string[]>(`${this.API_URL}/avatares`).subscribe({
      next: (datos) => this.avatares.set(datos),
      error: (e) => console.error('Error al cargar avatares:', e)
    });
  }

  // Buscar usuario por ID
  obtenerUsuarioPorId(id: string): Usuarios | undefined {
    return this._usuarios().find(u => u.id === id);
  }

  // POST: Crear usuario nuevo
  crearUsuario(nombre: string, avatar: string): void {
    this.http.post<{ mensaje: string; usuario: Usuarios }>(
      `${this.API_URL}/usuarios`,
      { nombre, avatar }
    ).subscribe({
      next: (res) => {
        // Actualizar signal global (RF-07)
        this._usuarios.update(lista => [...lista, res.usuario]);
      },
      error: (e) => console.error('Error al crear usuario:', e)
    });
  }

  // PUT: Editar usuario existente
  editarUsuario(id: string, nombre: string, avatar: string): void {
    this.http.put<{ mensaje: string; usuario: Usuarios }>(
      `${this.API_URL}/usuarios/${id}`,
      { nombre, avatar }
    ).subscribe({
      next: (res) => {
        if (res.usuario) {
          // Actualizar signal global (RF-07)
          this._usuarios.update(lista =>
            lista.map(u => u.id === id ? res.usuario : u)
          );
        }
      },
      error: (e) => console.error('Error al editar usuario:', e)
    });
  }

  // DELETE: Eliminar usuario + cascada
  eliminarUsuario(id: string): void {
    this.http.delete<{ mensaje: string; tareasEliminadas: number }>(
      `${this.API_URL}/usuarios/${id}`
    ).subscribe({
      next: () => {
        // Actualizar signal global (RF-07)
        this._usuarios.update(lista => lista.filter(u => u.id !== id));
      },
      error: (e) => console.error('Error al eliminar usuario:', e)
    });
  }
}

// ✅ RF/RNF cubiertos: [RF-01, RF-02, RF-05, RF-07]
