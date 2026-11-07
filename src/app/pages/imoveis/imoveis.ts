
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  ImoveisApiService,
  Imovel,
  ImovelRequest
} from '../../services/imoveis-api.service';

@Component({
  selector: 'app-imoveis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imoveis.html',
  styleUrl: './imoveis.css'
})
export class Imoveis implements OnInit {

  imoveis: Imovel[] = [];

  mostrarFormulario = false;
  carregando = false;
  salvando = false;

  mensagem = '';
  erro = '';

  imovelEmEdicaoId: number | null = null;

  // Controle do modal de exclusão
  mostrarModalExclusao = false;
  imovelSelecionado: Imovel | null = null;
  excluindo = false;

  novoImovel = this.formularioVazio();

  constructor(
    private imoveisService: ImoveisApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  private formularioVazio() {
    return {
      titulo: '',
      tipo: 'Apartamento',
      descricao: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      valorAluguel: 0,
      ativo: true
    };
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';

    this.cdr.detectChanges();

    this.imoveisService.listar()
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (dados) => {
          this.imoveis = dados;
          console.log('Imóveis carregados:', dados);
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao carregar imóveis:', erro);

          this.erro = erro.status === 401
            ? 'Sua sessão expirou. Faça login novamente.'
            : 'Não foi possível carregar os imóveis.';

          this.cdr.detectChanges();
        }
      });
  }

  novoCadastro(): void {
    this.novoImovel = this.formularioVazio();
    this.imovelEmEdicaoId = null;
    this.mensagem = '';
    this.erro = '';
    this.mostrarFormulario = true;

    this.cdr.detectChanges();
  }

  editar(imovel: Imovel): void {
    this.imovelEmEdicaoId = imovel.id;

    this.novoImovel = {
      titulo: imovel.titulo,
      tipo: imovel.tipo,
      descricao: imovel.descricao ?? '',
      endereco: imovel.endereco,
      numero: imovel.numero ?? '',
      complemento: imovel.complemento ?? '',
      bairro: imovel.bairro ?? '',
      cidade: imovel.cidade,
      estado: imovel.estado,
      cep: imovel.cep ?? '',
      valorAluguel: Number(imovel.valorAluguel),
      ativo: imovel.ativo
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

    const dados: ImovelRequest = {
      titulo: this.novoImovel.titulo.trim(),
      tipo: this.novoImovel.tipo,
      descricao: this.novoImovel.descricao.trim() || null,
      endereco: this.novoImovel.endereco.trim(),
      numero: this.novoImovel.numero.trim() || null,
      complemento: this.novoImovel.complemento.trim() || null,
      bairro: this.novoImovel.bairro.trim() || null,
      cidade: this.novoImovel.cidade.trim(),
      estado: this.novoImovel.estado.trim().toUpperCase(),
      cep: this.novoImovel.cep.trim() || null,
      valorAluguel: Number(this.novoImovel.valorAluguel),
      ativo: this.novoImovel.ativo
    };

    if (
      !dados.titulo ||
      !dados.tipo ||
      !dados.endereco ||
      !dados.cidade ||
      dados.estado.length !== 2 ||
      !Number.isFinite(dados.valorAluguel) ||
      dados.valorAluguel <= 0
    ) {
      this.erro = 'Confira os campos obrigatórios e o valor do aluguel.';
      this.cdr.detectChanges();
      return;
    }

    const editando = this.imovelEmEdicaoId !== null;

    this.salvando = true;
    this.cdr.detectChanges();

    const requisicao = editando
      ? this.imoveisService.atualizar(
          this.imovelEmEdicaoId!,
          dados
        )
      : this.imoveisService.cadastrar(dados);

    requisicao
      .pipe(
        finalize(() => {
          this.salvando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (imovelSalvo) => {
          console.log('Imóvel salvo:', imovelSalvo);

          this.mensagem = editando
            ? 'Imóvel atualizado com sucesso!'
            : 'Imóvel cadastrado com sucesso!';

          this.erro = '';
          this.mostrarFormulario = false;
          this.imovelEmEdicaoId = null;
          this.novoImovel = this.formularioVazio();

          this.cdr.detectChanges();
          this.carregar();
        },
        error: (erro) => {
          console.error('Erro ao salvar imóvel:', erro);

          this.erro = erro.status === 401
            ? 'Sua sessão expirou. Faça login novamente.'
            : erro.error?.message
            || 'Não foi possível salvar o imóvel. Confira os dados e tente novamente.';

          this.cdr.detectChanges();
        }
      });
  }

  // Abre o modal personalizado
  excluir(imovel: Imovel): void {
    if (this.excluindo) {
      return;
    }

    this.imovelSelecionado = imovel;
    this.mensagem = '';
    this.erro = '';
    this.mostrarModalExclusao = true;

    this.cdr.detectChanges();
  }

  // Fecha o modal sem excluir
  cancelarExclusao(): void {
    if (this.excluindo) {
      return;
    }

    this.mostrarModalExclusao = false;
    this.imovelSelecionado = null;

    this.cdr.detectChanges();
  }

  // Confirma e executa a exclusão
  confirmarExclusao(): void {
    if (!this.imovelSelecionado || this.excluindo) {
      return;
    }

    const id = this.imovelSelecionado.id;

    this.excluindo = true;
    this.erro = '';
    this.mensagem = '';

    this.cdr.detectChanges();

    this.imoveisService.excluir(id)
      .pipe(
        finalize(() => {
          this.excluindo = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.mensagem = 'Imóvel excluído com sucesso!';

          this.mostrarModalExclusao = false;
          this.imovelSelecionado = null;

          this.cdr.detectChanges();
          this.carregar();
        },
        error: (erro) => {
          console.error('Erro ao excluir imóvel:', erro);

          this.mostrarModalExclusao = false;
          this.imovelSelecionado = null;

          this.erro = erro.status === 401
            ? 'Sua sessão expirou. Faça login novamente.'
            : erro.error?.message
            || 'Não foi possível excluir o imóvel. Verifique se existem contratos vinculados.';

          this.cdr.detectChanges();
        }
      });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.imovelEmEdicaoId = null;
    this.novoImovel = this.formularioVazio();
    this.erro = '';

    this.cdr.detectChanges();
  }
}
