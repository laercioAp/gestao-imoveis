
import { Injectable } from '@angular/core';

export type StatusContrato = 'RASCUNHO' | 'ATIVO';

export interface ContratoLocacao {
  id: number;
  locadorNome: string;
  locadorCpf: string;
  locadorEndereco: string;
  inquilinoNome: string;
  inquilinoCpf: string;
  inquilinoEndereco: string;
  imovelEndereco: string;
  finalidade: string;
  valorAluguel: number;
  diaVencimento: number;
  dataInicio: string;
  dataFim: string;
  indiceReajuste: string;
  valorCaucao: number;
  observacoes: string;
  status: StatusContrato;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class ContratosService {
  private readonly chave = 'gestao-contratos-v1';

  listar(): ContratoLocacao[] {
    try {
      return JSON.parse(
        localStorage.getItem(this.chave) || '[]'
      ) as ContratoLocacao[];
    } catch {
      return [];
    }
  }

  salvarContrato(
    dados: Omit<ContratoLocacao, 'id' | 'criadoEm'>
  ): ContratoLocacao {
    const contratos = this.listar();

    const contrato: ContratoLocacao = {
      ...dados,
      id: contratos.length
        ? Math.max(...contratos.map(c => c.id)) + 1
        : 1,
      criadoEm: new Date().toISOString()
    };

    contratos.push(contrato);
    localStorage.setItem(this.chave, JSON.stringify(contratos));

    return contrato;
  }

  excluir(id: number): void {
    const contratos = this.listar().filter(c => c.id !== id);
    localStorage.setItem(this.chave, JSON.stringify(contratos));
  }
}