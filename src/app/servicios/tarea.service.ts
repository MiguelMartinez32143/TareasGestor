import { Injectable } from '@angular/core';
import { NuevaTareaInfo } from '../components/tarea/tarea.model';

@Injectable({
  providedIn: 'root',
})
export class TareaService {

  private tareas = [
    {
      id: 't1',
      idUsuario: 'u1',
      titulo: 'Dominar Angular',
      resumen: 'Apreder todas las características básicas y avanzasAngular cómo apicarlas.',
      expira: '2026-04-14'
    },
    {
      id: 't2',
      idUsuario: 'u3',
      titulo: 'Crear el primer prototipo',
      resumen: 'Crear el primer prototipo del sitio web de la tienda',
      expira: '2026-03-16',
    },
    {
      id: 't3',
      idUsuario: 'u3',
      titulo: 'Preparar la plantilla del carrito',
      resumen: 'Preparar y describir una plantilla de carrito de compras de la tienda online',
      expira: '2026-03-30',
    },
  ]

  constructor() {
    const tareas = localStorage.getItem('tareas')
    if (tareas) {
      this.tareas = JSON.parse(tareas);
    }
  }

  obtenerTareasDeUsuario(idUsuario: string) {
    return this.tareas.filter((tarea) => tarea.idUsuario === idUsuario);
  }

  agregarTarea(infoDeTarea: NuevaTareaInfo, idUsuario: string) {
    this.tareas.unshift({
      id: new Date().getTime().toString(),
      titulo: infoDeTarea.titulo,
      resumen: infoDeTarea.resumen,
      expira: infoDeTarea.fecha,
      idUsuario: idUsuario
    });
    this.guardarTareas();
  }

  eliminarTarea(id: string) {
    this.tareas = this.tareas.filter((tarea) => tarea.id !== id)
    this.guardarTareas();
  }

  private guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(this.tareas));
  }

}