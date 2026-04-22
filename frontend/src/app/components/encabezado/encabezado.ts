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

  // Agregar Admin
  mostrarAgregarAdmin = false;
  nuevoUsername = '';
  nuevoPassword = '';
  adminMensaje = '';
  adminError = '';
  cargandoAdmin = false;

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
    this.mostrarAgregarAdmin = false;
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

  // ========== AGREGAR ADMIN ==========
  abrirAgregarAdmin() {
    this.nuevoUsername = '';
    this.nuevoPassword = '';
    this.adminMensaje = '';
    this.adminError = '';
    this.mostrarAgregarAdmin = true;
    this.mostrarPerfil = false;
    this.mostrarGestionUsuarios = false;
  }

  cerrarAgregarAdmin() {
    this.mostrarAgregarAdmin = false;
  }

  alCrearAdmin() {
    if (!this.nuevoUsername || !this.nuevoPassword) {
      this.adminError = 'Complete ambos campos.';
      return;
    }

    this.cargandoAdmin = true;
    this.adminError = '';
    this.adminMensaje = '';

    this.authService.crearAdmin(this.nuevoUsername, this.nuevoPassword).subscribe({
      next: (res) => {
        this.adminMensaje = res.mensaje;
        this.nuevoUsername = '';
        this.nuevoPassword = '';
        this.cargandoAdmin = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.adminError = err.error?.mensaje || 'Error al crear administrador.';
        this.cargandoAdmin = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ========== GESTIÓN DE USUARIOS (RF-02) ==========
  abrirGestionUsuarios() {
    this.mostrarGestionUsuarios = true;
    this.mostrarPerfil = false;
    this.mostrarAgregarAdmin = false;
  }

  cerrarGestionUsuarios() {
    this.mostrarGestionUsuarios = false;
  }

  // ========== UTILIDADES ==========
  cerrarTodosLosModales() {
    this.mostrarFormLogin = false;
    this.mostrarPerfil = false;
    this.mostrarAgregarAdmin = false;
    this.mostrarGestionUsuarios = false;
  }
}