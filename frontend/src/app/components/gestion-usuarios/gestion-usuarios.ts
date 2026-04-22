import { Component, inject, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../servicios/usuario.service';
import { Usuarios } from '../usuario/usuario.model';

@Component({
  selector: 'app-gestion-usuarios',
  imports: [FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css',
})
export class GestionUsuarios {

  @Output() cerrar = new EventEmitter<void>();

  private usuarioService = inject(UsuarioService);

  // Vista actual: 'lista' | 'crear' | 'editar'
  vistaActual: 'lista' | 'crear' | 'editar' = 'lista';

  // Campos para crear
  nuevoNombre = '';
  nuevoAvatar = 'usuario-1.png';

  // Campos para editar
  editarId = '';
  editarNombre = '';
  editarAvatar = '';

  // Confirmación de eliminación
  idConfirmarEliminar = '';

  // Mensajes
  mensaje = '';
  error = '';

  get usuarios() {
    return this.usuarioService.usuarios();
  }

  get avatares() {
    return this.usuarioService.avatares();
  }

  get cargando() {
    return this.usuarioService.cargando();
  }

  // ====== VISTA LISTA ======
  irALista() {
    this.vistaActual = 'lista';
    this.limpiarMensajes();
  }

  // ====== CREAR ======
  irACrear() {
    this.nuevoNombre = '';
    this.nuevoAvatar = 'usuario-1.png';
    this.vistaActual = 'crear';
    this.limpiarMensajes();
  }

  alCrearUsuario() {
    if (!this.nuevoNombre.trim()) {
      this.error = 'El nombre es requerido.';
      return;
    }

    this.usuarioService.crearUsuario(this.nuevoNombre.trim(), this.nuevoAvatar);
    this.mensaje = `Usuario "${this.nuevoNombre.trim()}" creado correctamente.`;
    this.error = '';
    this.nuevoNombre = '';
    this.nuevoAvatar = 'usuario-1.png';

    // Volver a lista tras breve pausa
    setTimeout(() => {
      this.vistaActual = 'lista';
      this.limpiarMensajes();
    }, 1200);
  }

  // ====== EDITAR ======
  irAEditar(usuario: Usuarios) {
    this.editarId = usuario.id;
    this.editarNombre = usuario.nombre;
    this.editarAvatar = usuario.avatar;
    this.vistaActual = 'editar';
    this.limpiarMensajes();
  }

  alGuardarEdicion() {
    if (!this.editarNombre.trim()) {
      this.error = 'El nombre es requerido.';
      return;
    }

    this.usuarioService.editarUsuario(this.editarId, this.editarNombre.trim(), this.editarAvatar);
    this.mensaje = `Usuario actualizado correctamente.`;
    this.error = '';

    setTimeout(() => {
      this.vistaActual = 'lista';
      this.limpiarMensajes();
    }, 1200);
  }

  // ====== ELIMINAR ======
  pedirConfirmacion(id: string) {
    this.idConfirmarEliminar = id;
  }

  cancelarEliminacion() {
    this.idConfirmarEliminar = '';
  }

  confirmarEliminacion(id: string) {
    this.usuarioService.eliminarUsuario(id);
    this.idConfirmarEliminar = '';
    this.mensaje = 'Usuario y sus tareas eliminados correctamente.';

    setTimeout(() => this.limpiarMensajes(), 2000);
  }

  // ====== UTILIDADES ======
  obtenerRutaAvatar(avatar: string): string {
    if (avatar.startsWith('http')) {
      return avatar;
    }
    return 'img/' + avatar;
  }

  seleccionarAvatar(avatar: string, modo: 'crear' | 'editar') {
    if (modo === 'crear') {
      this.nuevoAvatar = avatar;
    } else {
      this.editarAvatar = avatar;
    }
  }

  alCerrar() {
    this.cerrar.emit();
  }

  private limpiarMensajes() {
    this.mensaje = '';
    this.error = '';
  }
}
