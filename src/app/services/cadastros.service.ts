
import { Injectable } from '@angular/core';

export interface Imovel {
  id: number;
  descricao: string;
  tipo: string;
  endereco: string;
  valorAluguel: number;
  diaVencimento: number;
  inquilino: string;
  situacao: 'ALUGADO' | 'DISPONIVEL';
}

export interface Inquilino {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CadastrosService {
  private readonly chaveImoveis = 'gestao-imoveis-v1';
  private readonly chaveInquilinos = 'gestao-inquilinos-v1';

  listarImoveis(): Imovel[] {
    return this.ler<Imovel>(this.chaveImoveis);
  }

  listarInquilinos(): Inquilino[] {
    return this.ler<Inquilino>(this.chaveInquilinos);
  }

  adicionarImovel(dados: Omit<Imovel, 'id'>): void {
    const imoveis = this.listarImoveis();
    const id = imoveis.length
      ? Math.max(...imoveis.map(item => item.id)) + 1
      : 1;

    imoveis.push({ ...dados, id });
    this.salvar(this.chaveImoveis, imoveis);
  }

  excluirImovel(id: number): void {
    const imoveis = this.listarImoveis()
      .filter(imovel => imovel.id !== id);

    this.salvar(this.chaveImoveis, imoveis);
  }

  adicionarInquilino(dados: Omit<Inquilino, 'id'>): void {
    const inquilinos = this.listarInquilinos();
    const id = inquilinos.length
      ? Math.max(...inquilinos.map(item => item.id)) + 1
      : 1;

    inquilinos.push({ ...dados, id });
    this.salvar(this.chaveInquilinos, inquilinos);
  }

  excluirInquilino(id: number): void {
    const inquilinos = this.listarInquilinos()
      .filter(inquilino => inquilino.id !== id);

    this.salvar(this.chaveInquilinos, inquilinos);
  }

  private ler<T>(chave: string): T[] {
    try {
      const dados = localStorage.getItem(chave);
      return dados ? JSON.parse(dados) as T[] : [];
    } catch {
      return [];
    }
  }

  private salvar<T>(chave: string, dados: T[]): void {
    localStorage.setItem(chave, JSON.stringify(dados));
  }
}