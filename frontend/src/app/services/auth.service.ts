import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  rol: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth/login';
  private registroUrl = 'http://localhost:8080/api/auth/registro';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, {
      username,
      password
    }).pipe(
      tap(response => localStorage.setItem('token', response.token))
    );
  }

  registrar(username: string, password: string): Observable<any> {
    return this.http.post(this.registroUrl, {
      username,
      password
    });
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerRol(): string | null {
    const token = this.obtenerToken();

    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodificado = atob(base64);
      const datos: JwtPayload = JSON.parse(decodificado);

      return datos.rol || null;
    } catch (error) {
      console.error('No se pudo leer el rol del token:', error);
      return null;
    }
  }

  esAdministrador(): boolean {
    return this.obtenerRol() === 'SUPER-ADMIN-ROLE';
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }
}



