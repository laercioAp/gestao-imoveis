import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  nome: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'token';
  private readonly NOME_KEY = 'usuario_nome';
  private readonly EMAIL_KEY = 'usuario_email';

  login(dados: LoginRequest): Observable<LoginResponse> {

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, dados)
      .pipe(
        tap((resposta) => {
          localStorage.setItem(this.TOKEN_KEY, resposta.token);
          localStorage.setItem(this.NOME_KEY, resposta.nome);
          localStorage.setItem(this.EMAIL_KEY, resposta.email);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.NOME_KEY);
    localStorage.removeItem(this.EMAIL_KEY);

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getNomeUsuario(): string | null {
    return localStorage.getItem(this.NOME_KEY);
  }

  getEmailUsuario(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  estaAutenticado(): boolean {
    return !!this.getToken();
  }
}