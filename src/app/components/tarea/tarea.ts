import { Component, inject, Input } from '@angular/core';
import { tarea } from './tarea.model';
import { Tarjeta } from '../tarjeta/tarjeta';
import { DatePipe } from '@angular/common';
import { TareaService } from '../../servicios/tarea.service';

@Component({
  selector: 'app-tarea',
  imports: [Tarjeta, DatePipe],
  templateUrl: './tarea.html',
  styleUrl: './tarea.css',
})
export class Tarea {

  @Input({ required: true }) tarea!: tarea;

  private tareasService = inject(TareaService)

  alCompletarTarea() {
    this.tareasService.eliminarTarea(this.tarea.id)
  }
}