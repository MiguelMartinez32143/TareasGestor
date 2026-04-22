import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NuevaTareaInfo, tarea } from '../components/tarea/tarea.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TareaService {

  private readonly API_URL = environment.apiUrl;
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private tareas: tarea[] = [];

  // --- INICIO CÓDIGO AÑADIDO ---
  cargando = false;
  // --- FIN CÓDIGO AÑADIDO ---

  constructor() {
    // Solo hacer llamadas HTTP en el navegador, no durante SSR/prerendering
    if (isPlatformBrowser(this.platformId)) {
      this.cargarTareasDesdeBackend();
    }
  }

  // GET: Cargar TODAS las tareas del backend (incluidas las completadas)
  // --- MIGRADO de fetch() a HttpClient para compatibilidad con Interceptor (RNF-C1) ---
  private cargarTareasDesdeBackend() {
    this.cargando = true;
    this.http.get<tarea[]>(`${this.API_URL}/tareas`).subscribe({
      next: (datos) => {
        this.tareas = datos;
        this.cargando = false;
      },
      error: (e) => {
        console.error('❌ Error al conectar con el backend.', e);
        this.cargando = false;
      }
    });
  }

  obtenerTareasDeUsuario(idUsuario: string) {
    return this.tareas.filter((tarea) => tarea.idUsuario === idUsuario);
  }

  // POST: Agregar tarea
  agregarTarea(infoDeTarea: NuevaTareaInfo, idUsuario: string) {
    const nuevaTarea: tarea = {
      id: new Date().getTime().toString(),
      titulo: infoDeTarea.titulo,
      resumen: infoDeTarea.resumen,
      expira: infoDeTarea.fecha,
      idUsuario: idUsuario,
      completada: 0
    };

    this.tareas.unshift(nuevaTarea);

    this.http.post(`${this.API_URL}/tareas`, nuevaTarea).subscribe({
      error: (e) => console.error('❌ Error guardando en backend', e)
    });
  }

  // PUT: Marcar tarea como completada (NO la borra, solo cambia completada = 1)
  completarTarea(id: string) {
    const tareaEncontrada = this.tareas.find((t) => t.id === id);
    if (tareaEncontrada) {
      tareaEncontrada.completada = 1;
    }

    this.http.put(`${this.API_URL}/tareas/${id}`, {}).subscribe({
      error: (e) => console.error('❌ Error completando tarea', e)
    });
  }

  // DELETE: Borrar tarea permanentemente de la base de datos
  borrarTarea(id: string) {
    this.tareas = this.tareas.filter((t) => t.id !== id);

    this.http.delete(`${this.API_URL}/tareas/${id}`).subscribe({
      error: (e) => console.error('❌ Error borrando tarea', e)
    });
  }

  // PUT: Editar campos de una tarea existente
  editarTarea(id: string, titulo: string, resumen: string, expira: string) {
    const tareaEncontrada = this.tareas.find((t) => t.id === id);
    if (tareaEncontrada) {
      tareaEncontrada.titulo = titulo;
      tareaEncontrada.resumen = resumen;
      tareaEncontrada.expira = expira;
    }

    this.http.put(`${this.API_URL}/tareas/${id}/editar`, { titulo, resumen, expira }).subscribe({
      error: (e) => console.error('❌ Error editando tarea', e)
    });
  }
}

// ✅ RF/RNF cubiertos: [RF-C1, RF-C2, RNF-C1, RNF-C2, RNF-C3]
// ⚠️ CONFLICTO DETECTADO: Métodos migrados de fetch() a HttpClient.
//    Necesario para que el authInterceptor (RNF-C1) inyecte JWT automáticamente.
//    La interfaz pública del servicio NO cambió — los componentes no requieren modificación.