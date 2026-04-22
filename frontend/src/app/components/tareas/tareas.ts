import { Component, inject, Input } from '@angular/core';
import { Tarea } from "../tarea/tarea";
import { NuevaTarea } from "../nueva-tarea/nueva-tarea";
import { NuevaTareaInfo } from '../tarea/tarea.model';
import { TareaService } from '../../servicios/tarea.service';
// --- INICIO CÓDIGO AÑADIDO ---
import { AuthService } from '../../servicios/auth.service';
import { AsyncPipe } from '@angular/common';
// --- FIN CÓDIGO AÑADIDO ---

@Component({
  selector: 'app-tareas',
  imports: [Tarea, NuevaTarea, AsyncPipe],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class Tareas {
  @Input({ required: true }) nombre!: string;
  @Input({ required: true }) idUsuario!: string;
  estaAgregandoTareaNueva = false;

  // --- INICIO CÓDIGO AÑADIDO ---
  authService = inject(AuthService);
  // --- FIN CÓDIGO AÑADIDO ---

  constructor(private tareasService: TareaService) { }

  get tareasUsuarioSeleccionado() {
    return this.tareasService.obtenerTareasDeUsuario(this.idUsuario)
  }

  // --- INICIO CÓDIGO AÑADIDO ---
  get cargando() {
    return this.tareasService.cargando;
  }
  // --- FIN CÓDIGO AÑADIDO ---

  alIniciarNuevaTarea() {
    this.estaAgregandoTareaNueva = true;
  }

  alCerrarTareaNueva() {
    this.estaAgregandoTareaNueva = false;
  }
}

// ✅ RF/RNF cubiertos: [RF-B2, RNF-C3]
// ⚠️ CONFLICTO DETECTADO: Ninguno
