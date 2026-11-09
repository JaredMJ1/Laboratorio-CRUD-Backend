import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username = '';
  password = '';
  confirmarPassword = '';

  modoRegistro = false;
  cargando = false;
  error = '';
  mensaje = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.username.trim() || !this.password) {
      this.error = 'Ingresa tu usuario y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = 'Usuario o contraseña incorrectos.';
      }
    });
  }

  registrar(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.username.trim() || !this.password || !this.confirmarPassword) {
      this.error = 'Completa todos los campos.';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;

    this.authService.registrar(this.username.trim(), this.password).subscribe({
      next: () => {
        this.cargando = false;
        this.modoRegistro = false;
        this.password = '';
        this.confirmarPassword = '';
        this.mensaje = 'Cuenta creada correctamente. Ya puedes iniciar sesión.';
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.mensaje || 'No se pudo registrar el usuario.';
      }
    });
  }

  cambiarModo(): void {
    this.modoRegistro = !this.modoRegistro;
    this.username = '';
    this.password = '';
    this.confirmarPassword = '';
    this.error = '';
    this.mensaje = '';
  }
}

