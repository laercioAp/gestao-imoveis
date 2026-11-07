import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import {
  Pagamento,
  PagamentosApiService
} from '../../services/pagamentos-api.service';

import {
  RecibosApiService
} from '../../services/recibos-api.service';

@Component({
  selector: 'app-novo-recibo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './novo-recibo.html',
  styleUrl: './novo-recibo.css'
})
export class NovoRecibo implements OnInit {
  alugueisPendentes: Pagamento[] = [];

  aluguelSelecionadoId: number | null = null;

  dataPagamento = this.hojeLocal();
  formaPagamento = 'PIX';

  mensagemErro = '';
  mensagemSucesso = '';

  carregando = false;
  registrando = false;

  constructor(
    private pagamentosApi: PagamentosApiService,
    private recibosApi: RecibosApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPendentes();
  }

  private carregarPendentes(): void {
    this.carregando = true;
    this.mensagemErro = '';

    this.pagamentosApi.listarPendentes()
      .pipe(finalize(() => {
        this.carregando = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (pagamentos) => {
          this.alugueisPendentes = pagamentos;
        },
        error: (erro) => {
          this.mensagemErro =
            erro?.error?.message ||
            'Não foi possível carregar os pagamentos pendentes.';
        }
      });
  }

  get aluguelSelecionado(): Pagamento | undefined {
    if (this.aluguelSelecionadoId === null) {
      return undefined;
    }

    return this.alugueisPendentes.find(
      pagamento => pagamento.id === this.aluguelSelecionadoId
    );
  }

  hojeLocal(): string {
    const hoje = new Date();

    return [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0')
    ].join('-');
  }

  formatarData(data: string | null): string {
    if (!data) return '—';

    const [ano, mes, dia] = data.split('-').map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }

  formatarCompetencia(competencia: string): string {
    if (!competencia) return '—';

    const [ano, mes] = competencia.split('-');

    return `${mes}/${ano}`;
  }

  registrarPagamento(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const pagamento = this.aluguelSelecionado;

    if (!pagamento) {
      this.mensagemErro = 'Selecione um aluguel pendente.';
      return;
    }

    if (!this.dataPagamento || !this.formaPagamento) {
      this.mensagemErro = 'Informe a data e a forma de pagamento.';
      return;
    }

    if (this.dataPagamento > this.hojeLocal()) {
      this.mensagemErro = 'A data do pagamento não pode ser futura.';
      return;
    }

    const confirmar = window.confirm(
      `Confirma o recebimento de ${this.formatarMoeda(pagamento.valorPrevisto)} ` +
      `referente ao imóvel ${pagamento.imovelTitulo}?`
    );

    if (!confirmar) return;

    this.registrando = true;

    this.pagamentosApi.registrarPagamento(
      pagamento.id,
      {
        valorPago: Number(pagamento.valorPrevisto),
        dataPagamento: this.dataPagamento,
        formaPagamento: this.formaPagamento
      }
    )
    .pipe(
      switchMap(() => this.recibosApi.emitir(pagamento.id)),
      switchMap((recibo) =>
        this.recibosApi.baixarPdf(recibo.pagamentoId)
      ),
      finalize(() => {
        this.registrando = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (resposta) => {
        if (!resposta.body) {
          this.mensagemErro =
            'O pagamento foi registrado, mas o PDF não foi retornado.';
          return;
        }

        const contentDisposition =
          resposta.headers.get('Content-Disposition');

        const nomeArquivo = this.extrairNomeArquivo(contentDisposition)
          || `recibo-${pagamento.id}.pdf`;

        this.baixarArquivo(resposta.body, nomeArquivo);

        this.mensagemSucesso =
          'Pagamento registrado e recibo gerado com sucesso!';

        this.alugueisPendentes = this.alugueisPendentes.filter(
          item => item.id !== pagamento.id
        );

        this.aluguelSelecionadoId = null;
        this.dataPagamento = this.hojeLocal();
        this.formaPagamento = 'PIX';

        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.mensagemErro =
          erro?.error?.message ||
          'Não foi possível concluir a operação. Verifique se o pagamento foi registrado antes de tentar novamente.';
      }
    });
  }

  private formatarMoeda(valor: number): string {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  private extrairNomeArquivo(
    contentDisposition: string | null
  ): string | null {
    if (!contentDisposition) return null;

    const resultado = contentDisposition.match(
      /filename="?([^";]+)"?/i
    );

    return resultado?.[1] || null;
  }

  private baixarArquivo(blob: Blob, nomeArquivo: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = nomeArquivo;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}