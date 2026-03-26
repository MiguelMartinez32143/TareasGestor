import { Injectable } from '@angular/core';
import { NuevaTareaInfo, tarea } from '../components/tarea/tarea.model';

@Injectable({
  providedIn: 'root',
})
export class TareaService {

  private tareas: tarea[] = [];

  constructor() {
    this.cargarTareasDesdeBackend();
  }

  // GET: Cargar tareas del backend al iniciar
  private async cargarTareasDesdeBackend() {
    try {
      const response = await fetch('http://localhost:3000/tareas');
      if (response.ok) {
        const datos = await response.json();
        this.tareas = datos;
      }
    } catch (e) {
      console.error('❌ Error al conectar con el backend (asegúrate de que está corriendo en el puerto 3000).', e);
    }
  }

  obtenerTareasDeUsuario(idUsuario: string) {
    return this.tareas.filter((tarea) => tarea.idUsuario === idUsuario);
  }

  // POST: Agregar tarea
  async agregarTarea(infoDeTarea: NuevaTareaInfo, idUsuario: string) {
    const nuevaTarea: tarea = {
      id: new Date().getTime().toString(),
      titulo: infoDeTarea.titulo,
      resumen: infoDeTarea.resumen,
      expira: infoDeTarea.fecha,
      idUsuario: idUsuario
    };
    
    // Lo guardamos localmente para repuesta visual inmediata
    this.tareas.unshift(nuevaTarea);

    // Lo enviamos a la Base de Datos usando el POST del backend
    try {
      await fetch('http://localhost:3000/tareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaTarea)
      });
    } catch (e) {
      console.error('❌ Error guardando en backend', e);
    }
  }

  // DELETE: Eliminar tarea
  async eliminarTarea(id: string) {
    // Eliminamos de local para respuesta visual
    this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
    
    // Eliminamos de la base de datos MySQL
    try {
      await fetch(`http://localhost:3000/tareas/${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('❌ Error eliminando del backend', e);
    }
  }
}