import { Component, inject } from '@angular/core';
import { Encabezado } from "./components/encabezado/encabezado";
import { Usuario } from './components/usuario/usuario';
import { Tareas } from './components/tareas/tareas';
import { UsuarioService } from './servicios/usuario.service';


@Component({
  selector: 'app-root',
  imports: [Encabezado, Usuario, Tareas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'proyecto_inicial';

  // Migración de USUARIOS_FALSOS a UsuarioService con Signals (RF-01, RF-07)
  private usuarioService = inject(UsuarioService);

  idUsuarioSeleccionado?: string;

  get usuarios() {
    return this.usuarioService.usuarios();
  }

  get usuarioSeleccionado() {
    return this.usuarios.find((usuario) => usuario.id === this.idUsuarioSeleccionado);
  }

  alSeleccionarUsuario(id: string) {
    this.idUsuarioSeleccionado = id;
  }

  alClickLogo() {
    this.idUsuarioSeleccionado = undefined;
  }
}
