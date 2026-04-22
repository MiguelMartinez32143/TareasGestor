import { Component, EventEmitter, inject, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { AsyncPipe } from '@angular/common';
import { GestionUsuarios } from '../gestion-usuarios/gestion-usuarios';

@Component({
  selector: 'app-encabezado',
  imports: [FormsModule, AsyncPipe, GestionUsuarios],
  templateUrl: './encabezado.html',
  styleUrl: './encabezado.css',
})
export class Encabezado {

  @Output() logoClick = new EventEmitter<void>();

  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  // Login
  mostrarFormLogin = false;
  username = '';
  password = '';
  errorLogin = '';
  cargandoLogin = false;

  // Perfil
  mostrarPerfil = false;
  perfilUsername = '';
  perfilPassword = '';
  perfilMensaje = '';
  perfilError = '';
  cargandoPerfil = false;

  // Gestión de Administradores
  mostrarGestionAdmins = false;
  listaAdmins: { id: number; username: string }[] = [];
  cargandoAdmins = false;
  adminsMensaje = '';
  adminsError = '';
  // Crear nuevo admin
  nuevoUsername = '';
  nuevoPassword = '';
  // Editar admin
  editandoAdminId: number | null = null;
  editAdminUsername = '';
  editAdminPassword = '';
  // Confirmar eliminación
  confirmarEliminarId: number | null = null;

  // Gestión de Usuarios (RF-02)
  mostrarGestionUsuarios = false;

  alClickLogo() {
    this.logoClick.emit();
  }

  // ========== LOGIN ==========
  toggleFormLogin() {
    this.mostrarFormLogin = !this.mostrarFormLogin;
    this.errorLogin = '';
  }

  alIniciarSesion() {
    if (!this.username || !this.password) {
      this.errorLogin = 'Complete ambos campos.';
      return;
    }

    this.cargandoLogin = true;
    this.errorLogin = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.mostrarFormLogin = false;
        this.username = '';
        this.password = '';
        this.cargandoLogin = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorLogin = 'Credenciales inválidas.';
        this.cargandoLogin = false;
        this.cdr.markForCheck();
      }
    });
  }

  alCerrarSesion() {
    this.authService.logout();
    this.cerrarTodosLosModales();
  }

  // ========== PERFIL ==========
  abrirPerfil() {
    const admin = this.authService.getAdmin();
    this.perfilUsername = admin?.username || '';
    this.perfilPassword = '';
    this.perfilMensaje = '';
    this.perfilError = '';
    this.mostrarPerfil = true;
    this.mostrarGestionAdmins = false;
    this.mostrarGestionUsuarios = false;
  }

  cerrarPerfil() {
    this.mostrarPerfil = false;
  }

  alGuardarPerfil() {
    if (!this.perfilUsername && !this.perfilPassword) {
      this.perfilError = 'Ingrese al menos un campo para actualizar.';
      return;
    }

    this.cargandoPerfil = true;
    this.perfilError = '';
    this.perfilMensaje = '';

    this.authService.editarPerfil(
      this.perfilUsername || undefined,
      this.perfilPassword || undefined
    ).subscribe({
      next: (res) => {
        this.perfilMensaje = res.mensaje;
        this.perfilPassword = '';
        this.cargandoPerfil = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.perfilError = err.error?.mensaje || 'Error al actualizar perfil.';
        this.cargandoPerfil = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ========== GESTIÓN DE ADMINISTRADORES ==========
  abrirGestionAdmins() {
    this.mostrarGestionAdmins = true;
    this.mostrarPerfil = false;
    this.mostrarGestionUsuarios = false;
    this.adminsMensaje = '';
    this.adminsError = '';
    this.editandoAdminId = null;
    this.confirmarEliminarId = null;
    this.nuevoUsername = '';
    this.nuevoPassword = '';
    this.cargarAdmins();
  }

  cerrarGestionAdmins() {
    this.mostrarGestionAdmins = false;
  }

  cargarAdmins() {
    this.cargandoAdmins = true;
    this.authService.listarAdmins().subscribe({
      next: (admins) => {
        this.listaAdmins = admins;
        this.cargandoAdmins = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.adminsError = 'Error al cargar administradores.';
        this.cargandoAdmins = false;
        this.cdr.markForCheck();
      }
    });
  }

  alCrearAdmin() {
    if (!this.nuevoUsername || !this.nuevoPassword) {
      this.adminsError = 'Complete ambos campos.';
      return;
    }

    this.adminsError = '';
    this.authService.crearAdmin(this.nuevoUsername, this.nuevoPassword).subscribe({
      next: (res) => {
        this.adminsMensaje = res.mensaje;
        this.nuevoUsername = '';
        this.nuevoPassword = '';
        this.cargarAdmins();
        this.cdr.markForCheck();
        setTimeout(() => { this.adminsMensaje = ''; this.cdr.markForCheck(); }, 2000);
      },
      error: (err) => {
        this.adminsError = err.error?.mensaje || 'Error al crear administrador.';
        this.cdr.markForCheck();
      }
    });
  }

  iniciarEdicionAdmin(admin: { id: number; username: string }) {
    this.editandoAdminId = admin.id;
    this.editAdminUsername = admin.username;
    this.editAdminPassword = '';
    this.adminsError = '';
    this.adminsMensaje = '';
  }

  cancelarEdicionAdmin() {
    this.editandoAdminId = null;
  }

  alGuardarEdicionAdmin() {
    if (!this.editAdminUsername && !this.editAdminPassword) {
      this.adminsError = 'Ingrese al menos un campo.';
      return;
    }

    this.adminsError = '';
    this.authService.editarAdmin(
      this.editandoAdminId!,
      this.editAdminUsername || undefined,
      this.editAdminPassword || undefined
    ).subscribe({
      next: (res) => {
        this.adminsMensaje = res.mensaje;
        this.editandoAdminId = null;
        this.cargarAdmins();

        // Si editó su propio admin, actualizar localStorage
        const me = this.authService.getAdmin();
        if (me && me.id === this.editandoAdminId && res.admin) {
          localStorage.setItem('admin', JSON.stringify(res.admin));
        }
        this.cdr.markForCheck();
        setTimeout(() => { this.adminsMensaje = ''; this.cdr.markForCheck(); }, 2000);
      },
      error: (err) => {
        this.adminsError = err.error?.mensaje || 'Error al editar administrador.';
        this.cdr.markForCheck();
      }
    });
  }

  pedirConfirmacionEliminar(id: number) {
    this.confirmarEliminarId = id;
  }

  cancelarEliminacion() {
    this.confirmarEliminarId = null;
  }

  confirmarEliminacionAdmin(id: number) {
    this.adminsError = '';
    this.authService.eliminarAdmin(id).subscribe({
      next: (res) => {
        this.adminsMensaje = res.mensaje;
        this.confirmarEliminarId = null;
        this.cargarAdmins();
        this.cdr.markForCheck();
        setTimeout(() => { this.adminsMensaje = ''; this.cdr.markForCheck(); }, 2000);
      },
      error: (err) => {
        this.adminsError = err.error?.mensaje || 'Error al eliminar.';
        this.confirmarEliminarId = null;
        this.cdr.markForCheck();
      }
    });
  }

  // ========== GESTIÓN DE USUARIOS (RF-02) ==========
  abrirGestionUsuarios() {
    this.mostrarGestionUsuarios = true;
    this.mostrarPerfil = false;
    this.mostrarGestionAdmins = false;
  }

  cerrarGestionUsuarios() {
    this.mostrarGestionUsuarios = false;
  }

  // ========== UTILIDADES ==========
  esAdminActual(id: number): boolean {
    return this.authService.getAdmin()?.id === id;
  }

  cerrarTodosLosModales() {
    this.mostrarFormLogin = false;
    this.mostrarPerfil = false;
    this.mostrarGestionAdmins = false;
    this.mostrarGestionUsuarios = false;
  }
}