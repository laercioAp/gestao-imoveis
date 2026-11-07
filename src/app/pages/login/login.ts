import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  senha = '';

  carregando = false;
  erro = '';

  mostrarSenha = false;

  entrar(): void {

    this.erro = '';

    if (!this.email.trim() || !this.senha) {
      this.erro = 'Informe seu e-mail e sua senha.';
      return;
    }

    this.carregando = true;

    this.authService.login({
      email: this.email.trim(),
      senha: this.senha
    })
    .pipe(
      finalize(() => {
        this.carregando = false;
      })
    )
    .subscribe({
      next: () => {
        this.router.navigate(['/inicio']);
      },
      error: (erro) => {

        if (erro.status === 401) {
          this.erro = 'E-mail ou senha inválidos.';
        } else if (erro.status === 0) {
          this.erro = 'Não foi possível conectar ao servidor.';
        } else {
          this.erro = 'Ocorreu um erro ao realizar o login.';
        }
      }
    });
  }
}