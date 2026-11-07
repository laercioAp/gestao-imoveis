
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  registerLocaleData
} from '@angular/common';

import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import localePt from '@angular/common/locales/pt';

import {
  PagamentosApiService,
  Pagamento,
  GerarMensalidadeResponse
} from '../../services/pagamentos-api.service';

import {
  ContratosApiService,
  Contrato
} from '../../services/contratos-api.service';

registerLocaleData(localePt);

type FiltroPagamento = 'TODOS' | 'PENDENTES' | 'PAGOS' | 'ATRASADOS';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    RouterLink
  ],
  templateUrl: './pagamentos.html',
  styleUrl: './pagamentos.css'
})
export class Pagamentos implements OnInit {

  private readonly pagamentosService = inject(PagamentosApiService);
  private readonly contratosService = inject(ContratosApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  pagamentos: Pagamento[] = [];
  contratosAtivos: Contrato[] = [];

  carregando = false;
  carregandoContratos = false;
  gerando = false;
  carregamentoConcluido = false;

  mensagemSucesso = '';
  mensagemErro = '';
  mensagemErroContratos = '';

  filtro: FiltroPagamento = 'TODOS';

  competencia = this.obterCompetenciaAtual();

  // null significa gerar para todos os contratos ativos.
  contratoSelecionadoId: number | null = null;

  resultadoGeracao: GerarMensalidadeResponse | null = null;

  ngOnInit(): void {
    this.carregarContratosAtivos();
    this.carregarPagamentos();
  }

  private obterCompetenciaAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');

    return `${ano}-${mes}`;
  }

  carregarContratosAtivos(): void {

    this.carregandoContratos = true;
    this.mensagemErroContratos = '';

    this.contratosService.listarPorStatus('ATIVO')
      .pipe(
        finalize(() => {
          this.carregandoContratos = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: (resposta: Contrato[]) => {
          this.contratosAtivos = Array.isArray(resposta)
            ? resposta
            : [];

          this.cdr.detectChanges();
        },

        error: (erro) => {
          console.error('Erro ao carregar contratos ativos:', erro);

          this.contratosAtivos = [];
          this.mensagemErroContratos =
            'Não foi possível carregar os contratos ativos.';

          this.cdr.detectChanges();
        }

      });
  }

  carregarPagamentos(): void {

    if (this.carregando) {
      return;
    }

    this.carregando = true;
    this.carregamentoConcluido = false;
    this.mensagemErro = '';

    this.cdr.detectChanges();

    this.pagamentosService.listar()
      .pipe(
        finalize(() => {

          this.carregando = false;
          this.carregamentoConcluido = true;

          this.cdr.detectChanges();

          console.log('Carregamento de pagamentos finalizado.');
          console.log('Total de pagamentos:', this.pagamentos.length);

        })
      )
      .subscribe({

        next: (resposta: Pagamento[]) => {

          console.log('Resposta da API de pagamentos:', resposta);

          this.pagamentos = Array.isArray(resposta)
            ? resposta
            : [];

          this.cdr.detectChanges();

        },

        error: (erro) => {

          console.error('Erro ao carregar pagamentos:', erro);

          this.pagamentos = [];

          this.mensagemErro =
            'Não foi possível carregar os pagamentos. Tente atualizar a página.';

          this.cdr.detectChanges();

        }

      });
  }

  gerarMensalidades(): void {

    if (!this.competencia || this.gerando) {
      return;
    }

    if (
      this.contratoSelecionadoId !== null &&
      !this.contratosAtivos.some(
        contrato => contrato.id === this.contratoSelecionadoId
      )
    ) {
      this.mensagemErro = 'Selecione um contrato ativo válido.';
      return;
    }

    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.resultadoGeracao = null;
    this.gerando = true;

    this.cdr.detectChanges();

    const competenciaCompleta = `${this.competencia}-01`;

    this.pagamentosService.gerarMensalidades(
      competenciaCompleta,
      this.contratoSelecionadoId
    )
      .pipe(
        finalize(() => {

          this.gerando = false;

          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: (resposta: GerarMensalidadeResponse) => {

          this.resultadoGeracao = resposta;

          this.mensagemSucesso =
            `Geração concluída! ${resposta.quantidadeGerada} mensalidade(s) gerada(s), ` +
            `${resposta.quantidadeJaExistente} já existente(s) e ` +
            `${resposta.quantidadeContratosIgnorados} contrato(s) ignorado(s).`;

          this.cdr.detectChanges();

          this.carregarPagamentos();

        },

        error: (erro) => {

          console.error('Erro ao gerar mensalidades:', erro);

          this.mensagemErro =
            erro?.error?.message ??
            erro?.error?.mensagem ??
            'Não foi possível gerar as mensalidades. Verifique o backend.';

          this.cdr.detectChanges();

        }

      });
  }

  alterarFiltro(filtro: FiltroPagamento): void {

    this.filtro = filtro;

    this.cdr.detectChanges();

  }

  get pagamentosFiltrados(): Pagamento[] {

    if (this.filtro === 'PENDENTES') {
      return this.pagamentos.filter((pagamento: Pagamento) =>
        pagamento.status === 'PENDENTE' && !this.estaAtrasado(pagamento)
      );
    }

    if (this.filtro === 'PAGOS') {
      return this.pagamentos.filter((pagamento: Pagamento) =>
        pagamento.status === 'PAGO'
      );
    }

    if (this.filtro === 'ATRASADOS') {
      return this.pagamentos.filter((pagamento: Pagamento) =>
        this.estaAtrasado(pagamento)
      );
    }

    return this.pagamentos;
  }

  estaAtrasado(pagamento: Pagamento): boolean {

    if (pagamento.status !== 'PENDENTE') {
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = new Date(
      `${pagamento.dataVencimento}T00:00:00`
    );

    return vencimento < hoje;
  }

  get totalPrevisto(): number {

    return this.pagamentos.reduce(
      (total, pagamento) =>
        total + Number(pagamento.valorPrevisto || 0),
      0
    );

  }

  get totalRecebido(): number {

    return this.pagamentos
      .filter((pagamento: Pagamento) =>
        pagamento.status === 'PAGO'
      )
      .reduce(
        (total, pagamento) =>
          total + Number(pagamento.valorPago || 0),
        0
      );

  }

  get totalPendente(): number {

    return this.pagamentos
      .filter((pagamento: Pagamento) =>
        pagamento.status === 'PENDENTE'
      )
      .reduce(
        (total, pagamento) =>
          total + Number(pagamento.valorPrevisto || 0),
        0
      );

  }

  get totalAtrasado(): number {

    return this.pagamentos
      .filter((pagamento: Pagamento) =>
        this.estaAtrasado(pagamento)
      )
      .reduce(
        (total, pagamento) =>
          total + Number(pagamento.valorPrevisto || 0),
        0
      );

  }

  get quantidadePendentes(): number {

    return this.pagamentos.filter(
      (pagamento: Pagamento) =>
        pagamento.status === 'PENDENTE' &&
        !this.estaAtrasado(pagamento)
    ).length;

  }

  get quantidadePagos(): number {

    return this.pagamentos.filter(
      (pagamento: Pagamento) =>
        pagamento.status === 'PAGO'
    ).length;

  }

  get quantidadeAtrasados(): number {

    return this.pagamentos.filter(
      (pagamento: Pagamento) =>
        this.estaAtrasado(pagamento)
    ).length;

  }

}