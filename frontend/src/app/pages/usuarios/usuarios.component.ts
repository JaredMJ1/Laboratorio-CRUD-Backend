import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import {
  UsuariosService,
  Usuario,
  Rol,
  UsuarioRequest
} from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {

  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  usuario: UsuarioRequest = {
    username: '',
    password: '',
    rol: ''
  };

  idSeleccionado: number | null = null;
  modoEdicion = false;
  mostrarFormulario = false;
  cargando = false;

  mensaje = '';
  error = '';

  constructor(
  private usuariosService: UsuariosService,
  public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.cargando = true;

    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los usuarios.';
        this.cargando = false;
      }
    });
  }

  cargarRoles(): void {
    this.usuariosService.listarRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los roles.';
      }
    });
  }

  nuevoUsuario(): void {
    this.limpiarFormulario();
    this.mostrarFormulario = true;
  }

  editarUsuario(usuario: Usuario): void {
    this.idSeleccionado = usuario.id;
    this.modoEdicion = true;
    this.mostrarFormulario = true;

    this.usuario = {
      username: usuario.username,
      password: '',
      rol: usuario.rol
    };

    this.mensaje = '';
    this.error = '';
  }

  guardarUsuario(): void {
    this.mensaje = '';
    this.error = '';

    if (!this.usuario.username.trim() || !this.usuario.rol) {
      this.error = 'Completa el nombre de usuario y el rol.';
      return;
    }

    if (!this.modoEdicion && !this.usuario.password?.trim()) {
      this.error = 'La contraseña es obligatoria para crear un usuario.';
      return;
    }

    const datos: UsuarioRequest = {
      username: this.usuario.username.trim(),
      rol: this.usuario.rol,
      password: this.usuario.password?.trim() || undefined
    };

    if (this.modoEdicion && this.idSeleccionado !== null) {
      this.usuariosService.actualizar(this.idSeleccionado, datos).subscribe({
        next: () => {
          this.mensaje = 'Usuario actualizado correctamente.';
          this.cargarUsuarios();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.mensaje || 'No se pudo actualizar el usuario.';
        }
      });
    } else {
      this.usuariosService.crear(datos).subscribe({
        next: () => {
          this.mensaje = 'Usuario creado correctamente.';
          this.cargarUsuarios();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error(err);
          this.error = err.error?.mensaje || 'No se pudo crear el usuario.';
        }
      });
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = confirm(
      `¿Seguro que deseas eliminar al usuario "${usuario.username}"?`
    );

    if (!confirmar) return;

    this.usuariosService.eliminar(usuario.id).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado correctamente.';
        this.error = '';
        this.cargarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo eliminar el usuario.';
      }
    });
  }

  limpiarFormulario(): void {
    this.usuario = {
      username: '',
      password: '',
      rol: ''
    };

    this.idSeleccionado = null;
    this.modoEdicion = false;
    this.mostrarFormulario = false;
  }

}
