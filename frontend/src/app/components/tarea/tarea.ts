import { Component, inject, Input } from '@angular/core';
import { tarea } from './tarea.model';
import { Tarjeta } from '../tarjeta/tarjeta';
import { DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService } from '../../servicios/tarea.service';
// --- INICIO CÓDIGO AÑADIDO ---
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-tarea',
  imports: [Tarjeta, DatePipe, FormsModule, NgClass],
  templateUrl: './tarea.html',
  styleUrl: './tarea.css',
})
export class Tarea {

  @Input({ required: true }) tarea!: tarea;

  private tareasService = inject(TareaService);
  private authService = inject(AuthService);
  esAdmin = false;
  // --- FIN CÓDIGO AÑADIDO ---

  // Estados de UI
  editando = false;
  mostrarConfirmacion = false;

  // --- INICIO CÓDIGO AÑADIDO ---
  constructor() {
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.esAdmin = loggedIn;
    });
  }
  // --- FIN CÓDIGO AÑADIDO ---

  // Campos temporales para edición inline
  tituloEditado = '';
  resumenEditado = '';
  expiraEditado = '';

  // ====== COMPLETAR ======
  alCompletarTarea() {
    this.tareasService.completarTarea(this.tarea.id);
  }

  // ====== EDITAR ======
  alEditarTarea() {
    this.tituloEditado = this.tarea.titulo;
    this.resumenEditado = this.tarea.resumen;
    this.expiraEditado = this.tarea.expira;
    this.editando = true;
  }

  alGuardarEdicion() {
    this.tareasService.editarTarea(
      this.tarea.id,
      this.tituloEditado,
      this.resumenEditado,
      this.expiraEditado
    );
    this.editando = false;
  }

  alCancelarEdicion() {
    this.editando = false;
  }

  // ====== BORRAR ======
  alBorrarTarea() {
    this.mostrarConfirmacion = true;
  }

  confirmarBorrado() {
    this.tareasService.borrarTarea(this.tarea.id);
    this.mostrarConfirmacion = false;
  }

  cancelarBorrado() {
    this.mostrarConfirmacion = false;
  }
}