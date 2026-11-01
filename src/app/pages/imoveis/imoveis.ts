
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CadastrosService, Imovel } from '../../services/cadastros.service';

@Component({
  selector: 'app-imoveis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imoveis.html',
  styleUrl: './imoveis.css'
})
export class Imoveis {
  imoveis: Imovel[] = [];
  mostrarFormulario = false;
  mensagem = '';

  novoImovel = this.formularioVazio();

  constructor(private cadastros: CadastrosService) {
    this.carregar();
  }

  private formularioVazio() {
    return {
      descricao: '',
      tipo: 'Apartamento',
      endereco: '',
      valorAluguel: 0,
      diaVencimento: 10,
      inquilino: '',
      situacao: 'DISPONIVEL' as 'ALUGADO' | 'DISPONIVEL'
    };
  }

  carregar(): void {
    this.imoveis = this.cadastros.listarImoveis();
  }

  salvar(): void {
    this.mensagem = '';

    if (
      !this.novoImovel.descricao.trim() ||
      !this.novoImovel.endereco.trim() ||
      this.novoImovel.valorAluguel <= 0 ||
      this.novoImovel.diaVencimento < 1 ||
      this.novoImovel.diaVencimento > 31
    ) {
      this.mensagem = 'Preencha a descrição, o endereço, o valor e um dia de vencimento válido.';
      return;
    }

    if (
      this.novoImovel.situacao === 'ALUGADO' &&
      !this.novoImovel.inquilino.trim()
    ) {
      this.mensagem = 'Informe o nome do inquilino para um imóvel alugado.';
      return;
    }

    this.cadastros.adicionarImovel({
      ...this.novoImovel,
      descricao: this.novoImovel.descricao.trim(),
      endereco: this.novoImovel.endereco.trim(),
      inquilino: this.novoImovel.inquilino.trim()
    });

    this.carregar();
    this.novoImovel = this.formularioVazio();
    this.mostrarFormulario = false;
    this.mensagem = 'Imóvel cadastrado com sucesso!';
  }

  excluir(id: number): void {
    if (confirm('Deseja realmente excluir este imóvel?')) {
      this.cadastros.excluirImovel(id);
      this.carregar();
    }
  }
}