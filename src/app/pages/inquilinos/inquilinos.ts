import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  InquilinosApiService,
  Inquilino,
  InquilinoRequest
} from '../../services/inquilinos-api.service';

@Component({
  selector: 'app-inquilinos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inquilinos.html',
  styleUrl: './inquilinos.css'
})
export class Inquilinos implements OnInit {

  inquilinos: Inquilino[] = [];

  mostrarFormulario = false;
  carregando = false;
  salvando = false;
  excluindoId: number | null = null;

  // Controle do modal de exclusão
  mostrarModalExclusao = false;
  inquilinoSelecionado: Inquilino | null = null;

  mensagem = '';
  erro = '';

  inquilinoEmEdicaoId: number | null = null;

  novoInquilino = this.formularioVazio();

  constructor(
    private inquilinosService: InquilinosApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    this.carregando = true;
    this.erro = '';

    this.inquilinosService.listar()
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (dados) => {
          this.inquilinos = dados;
          console.log('Inquilinos carregados:', dados);
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao carregar inquilinos:', erro);

          this.erro = erro.status === 401
            ? 'Sua sessão expirou. Faça login novamente.'
            : 'Não foi possível carregar os inquilinos.';

          this.cdr.detectChanges();
        }
      });
  }

  novoCadastro(): void {
    this.novoInquilino = this.formularioVazio();
    this.inquilinoEmEdicaoId = null;
    this.mensagem = '';
    this.erro = '';
    this.mostrarFormulario = true;

    this.cdr.detectChanges();
  }

  editar(inquilino: Inquilino): void {
    this.inquilinoEmEdicaoId = inquilino.id;

    this.novoInquilino = {
      nome: inquilino.nome,
      cpf: inquilino.cpf ?? '',
      telefone: inquilino.telefone ?? '',
      email: inquilino.email ?? ''
    };

    this.mensagem = '';
    this.erro = '';
    this.mostrarFormulario = true;

    this.cdr.detectChanges();
  }

  salvar(): void {
    if (this.salvando) {
      return;
    }

    this.mensagem = '';
    this.erro = '';

    const dados: InquilinoRequest = {
      nome: this.novoInquilino.nome.trim(),
      cpf: this.novoInquilino.cpf.trim(),
      telefone: this.novoInquilino.telefone.trim(),
      email: this.novoInquilino.email.trim() || null,

      endereco: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,

      ativo: true
    };

    if (!dados.nome || !dados.cpf || !dados.telefone) {
      this.erro = 'Informe nome, CPF e telefone.';
      return;
    }

    if (!/^(?:\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})$/.test(dados.cpf)) {
      this.erro = 'Informe um CPF com 11 dígitos.';
      return;
    }

    if (
      dados.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)
    ) {
      this.erro = 'Informe um e-mail válido.';
      return;
    }

    const editando = this.inquilinoEmEdicaoId !== null;

    this.salvando = true;
    this.cdr.detectChanges();

    const requisicao = editando
      ? this.inquilinosService.atualizar(
          this.inquilinoEmEdicaoId!,
          dados
        )
      : this.inquilinosService.cadastrar(dados);

    requisicao
      .pipe(
        finalize(() => {
          this.salvando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (inquilinoSalvo) => {
          console.log('Inquilino salvo:', inquilinoSalvo);

          this.mensagem = editando
            ? 'Inquilino atualizado com sucesso!'
            : 'Inquilino cadastrado com sucesso!';

          this.erro = '';
          this.mostrarFormulario = false;
          this.inquilinoEmEdicaoId = null;
          this.novoInquilino = this.formularioVazio();

          this.cdr.detectChanges();
          this.carregar();
        },
        error: (erro) => {
          console.error('Erro ao salvar inquilino:', erro);

          this.erro = erro.status === 401
            ? 'Sua sessão expirou. Faça login novamente.'
            : erro.status === 409
              ? erro.error?.message || 'Já existe um inquilino com esses dados.'
              : erro.error?.message
                || 'Não foi possível salvar o inquilino. Confira os dados.';

          this.cdr.detectChanges();
        }
      });
  }

  // Abre o modal personalizado
  excluir(inquilino: Inquilino): void {
    if (this.excluindoId !== null) {
      return;
    }

    this.inquilinoSelecionado = inquilino;
    this.mensagem = '';
    this.erro = '';
    this.mostrarModalExclusao = true;

    this.cdr.detectChanges();
  }

  // Cancela a exclusão
  cancelarExclusao(): void {
    if (this.excluindoId !== null) {
      return;
    }

    this.mostrarModalExclusao = false;
    this.inquilinoSelecionado = null;

    this.cdr.detectChanges();
  }

  // Confirma e executa a exclusão
  confirmarExclusao(): void {
    if (
      !this.inquilinoSelecionado ||
      this.excluindoId !== null
    ) {
      return;
    }

    const id = this.inquilinoSelecionado.id;

    this.erro = '';
    this.mensagem = '';
    this.excluindoId = id;

    this.cdr.detectChanges();

    this.inquilinosService.excluir(id)
      .pipe(
        finalize(() => {
          this.excluindoId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.mensagem = 'Inquilino excluído com sucesso!';

          this.mostrarModalExclusao = false;
          this.inquilinoSelecionado = null;

          this.cdr.detectChanges();
          this.carregar();
        },
        error: (erro) => {
          console.error('Erro ao excluir inquilino:', erro);

          this.mostrarModalExclusao = false;
          this.inquilinoSelecionado = null;

          this.erro = erro.status === 401
            ? 'Sua sessão expirou. Faça login novamente.'
            : erro.status === 409
              ? erro.error?.message
                || 'Este inquilino possui contratos vinculados e não pode ser excluído.'
              : erro.error?.message
                || 'Não foi possível excluir o inquilino.';

          this.cdr.detectChanges();
        }
      });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.inquilinoEmEdicaoId = null;
    this.novoInquilino = this.formularioVazio();
    this.erro = '';

    this.cdr.detectChanges();
  }
}