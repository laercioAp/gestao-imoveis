
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CadastrosService, Inquilino } from '../../services/cadastros.service';

@Component({
  selector: 'app-inquilinos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquilinos.html',
  styleUrl: './inquilinos.css'
})
export class Inquilinos {
  inquilinos: Inquilino[] = [];
  mostrarFormulario = false;
  mensagem = '';

  novoInquilino = this.formularioVazio();

  constructor(private cadastros: CadastrosService) {
    this.carregar();
  }

  private formularioVazio() {
    return {
      nome: '',
      cpf: '',
      telefone: '',
      email: ''
    };
  }

  carregar(): void {
    this.inquilinos = this.cadastros.listarInquilinos();
  }

  salvar(): void {
    this.mensagem = '';

    if (!this.novoInquilino.nome.trim()) {
      this.mensagem = 'Informe o nome completo do inquilino.';
      return;
    }

    if (
      this.novoInquilino.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.novoInquilino.email.trim())
    ) {
      this.mensagem = 'Informe um e-mail válido.';
      return;
    }

    this.cadastros.adicionarInquilino({
      nome: this.novoInquilino.nome.trim(),
      cpf: this.novoInquilino.cpf.trim(),
      telefone: this.novoInquilino.telefone.trim(),
      email: this.novoInquilino.email.trim()
    });

    this.carregar();
    this.novoInquilino = this.formularioVazio();
    this.mostrarFormulario = false;
    this.mensagem = 'Inquilino cadastrado com sucesso!';
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este inquilino?')) {
      this.cadastros.excluirInquilino(id);
      this.carregar();
    }
  }
}