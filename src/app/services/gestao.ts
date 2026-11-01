
import { Injectable } from '@angular/core';

export type StatusAluguel = 'PENDENTE' | 'PAGO';

export interface Aluguel {
  id: number;
  imovel: string;
  inquilino: string;
  valor: number;
  competencia: string; // Formato: AAAA-MM
  vencimento: string; // Formato: AAAA-MM-DD
  status: StatusAluguel;
  dataPagamento?: string;
  formaPagamento?: string;
  numeroRecibo?: string;
}

const CHAVE_STORAGE = 'gestao-alugueis-v1';

@Injectable({
  providedIn: 'root'
})
export class GestaoService {
  private alugueis: Aluguel[] = [];

  constructor() {
    this.carregarDados();
  }

  private carregarDados(): void {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos) {
      try {
        this.alugueis = JSON.parse(dadosSalvos) as Aluguel[];

        if (this.alugueis.length > 0) {
          return;
        }
      } catch {
        localStorage.removeItem(CHAVE_STORAGE);
      }
    }

    this.alugueis = [
      {
        id: 1,
        imovel: 'Apartamento - Jardim Central',
        inquilino: 'Maria Oliveira',
        valor: 1800,
        competencia: '2026-10',
        vencimento: '2026-10-10',
        status: 'PAGO',
        dataPagamento: '2026-10-05',
        formaPagamento: 'PIX',
        numeroRecibo: 'REC-0001'
      },
      {
        id: 2,
        imovel: 'Vaga de garagem - Jardim Europa',
        inquilino: 'Beatriz Santos',
        valor: 200,
        competencia: '2026-10',
        vencimento: '2026-10-10',
        status: 'PENDENTE'
      },
      {
        id: 3,
        imovel: 'Apartamento - Jardim Central',
        inquilino: 'Maria Oliveira',
        valor: 1800,
        competencia: '2026-11',
        vencimento: '2026-11-10',
        status: 'PENDENTE'
      }
    ];

    this.salvarDados();
  }

  private salvarDados(): void {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(this.alugueis));
  }

  listar(): Aluguel[] {
    return [...this.alugueis].sort((a, b) =>
      a.vencimento.localeCompare(b.vencimento)
    );
  }

  buscarPorId(id: number): Aluguel | undefined {
    return this.alugueis.find(aluguel => aluguel.id === id);
  }

  estaAtrasado(aluguel: Aluguel): boolean {
    return aluguel.status === 'PENDENTE' &&
      aluguel.vencimento < this.dataLocalHoje();
  }

  private dataLocalHoje(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  registrarPagamento(
    id: number,
    dataPagamento: string,
    formaPagamento: string
  ): Aluguel {
    const aluguel = this.buscarPorId(id);

    if (!aluguel) {
      throw new Error('Aluguel não encontrado.');
    }

    if (aluguel.status === 'PAGO') {
      throw new Error('Este aluguel já está pago.');
    }

    if (dataPagamento > this.dataLocalHoje()) {
      throw new Error('A data do pagamento não pode ser futura.');
    }

    if (!dataPagamento || !formaPagamento) {
      throw new Error('Preencha a data e a forma de pagamento.');
    }

    aluguel.status = 'PAGO';
    aluguel.dataPagamento = dataPagamento;
    aluguel.formaPagamento = formaPagamento;
    aluguel.numeroRecibo = `REC-${String(aluguel.id).padStart(4, '0')}`;

    this.salvarDados();

    return { ...aluguel };
  }

  proximoId(): number {
    return this.alugueis.length
      ? Math.max(...this.alugueis.map(a => a.id)) + 1
      : 1;
  }

  adicionarAluguel(aluguel: Omit<Aluguel, 'id'>): Aluguel {
    const novo: Aluguel = {
      ...aluguel,
      id: this.proximoId()
    };

    this.alugueis.push(novo);
    this.salvarDados();

    return { ...novo };
  }

  totalRecebido(competencia: string): number {
    return this.alugueis
      .filter(a => a.competencia === competencia && a.status === 'PAGO')
      .reduce((total, a) => total + a.valor, 0);
  }

  totalPendente(competencia: string): number {
    return this.alugueis
      .filter(a => a.competencia === competencia && a.status === 'PENDENTE')
      .reduce((total, a) => total + a.valor, 0);
  }

  totalAtrasado(competencia: string): number {
    return this.alugueis
      .filter(a =>
        a.competencia === competencia &&
        this.estaAtrasado(a)
      )
      .reduce((total, a) => total + a.valor, 0);
  }
}
