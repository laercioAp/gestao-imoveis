
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {
  PagamentosApiService,
  Pagamento
} from '../../services/pagamentos-api.service';

import {
  ContratosApiService,
  Contrato
} from '../../services/contratos-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  pagamentos: Pagamento[] = [];
  pagamentosCompetencia: Pagamento[] = [];
  contratosAtivos: Contrato[] = [];

  competenciaAtual = this.obterCompetenciaAtual();
  mesAtual = '';

  recebidos = 0;
  pendentes = 0;
  atrasados = 0;
  quantidadeContratosAtivos = 0;

  carregando = false;
  mensagemErro = '';

  constructor(
    private pagamentosService: PagamentosApiService,
    private contratosService: ContratosApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.atualizarNomeMes();
    this.carregarDados();
  }

  private obterCompetenciaAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');

    return `${ano}-${mes}`;
  }

  carregarDados(): void {
    this.carregando = true;
    this.mensagemErro = '';

    forkJoin({
      pagamentos: this.pagamentosService.listar(),
      contratos: this.contratosService.listarPorStatus('ATIVO')
    })
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resultado) => {
          this.pagamentos = resultado.pagamentos;
          this.contratosAtivos = resultado.contratos;

          this.quantidadeContratosAtivos = this.contratosAtivos.length;

          this.atualizarDashboard();

          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('Erro ao carregar Dashboard:', erro);

          this.mensagemErro =
            'Não foi possível carregar os dados do Dashboard. Verifique sua conexão com o servidor.';

          this.pagamentos = [];
          this.pagamentosCompetencia = [];
          this.contratosAtivos = [];
          this.quantidadeContratosAtivos = 0;

          this.calcularTotais();

          this.cdr.detectChanges();
        }
      });
  }

  atualizarDashboard(): void {
    this.atualizarNomeMes();

    this.pagamentosCompetencia = this.pagamentos.filter(pagamento =>
      pagamento.competencia?.substring(0, 7) === this.competenciaAtual
    );

    this.calcularTotais();
  }

  private atualizarNomeMes(): void {
    if (!this.competenciaAtual) {
      this.mesAtual = '';
      return;
    }

    const [ano, mes] = this.competenciaAtual.split('-').map(Number);

    const nomeMes = new Date(ano, mes - 1, 1)
      .toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });

    this.mesAtual =
      nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  }

  private calcularTotais(): void {
    this.recebidos = this.pagamentosCompetencia
      .filter(p => p.status === 'PAGO')
      .reduce((total, p) => total + (p.valorPago ?? 0), 0);

    this.pendentes = this.pagamentosCompetencia
      .filter(p => p.status === 'PENDENTE' && !this.estaAtrasado(p))
      .reduce((total, p) => total + p.valorPrevisto, 0);

    this.atrasados = this.pagamentosCompetencia
      .filter(p => this.estaAtrasado(p))
      .reduce((total, p) => total + p.valorPrevisto, 0);
  }

  estaAtrasado(pagamento: Pagamento): boolean {
    if (pagamento.status !== 'PENDENTE') {
      return false;
    }

    const hoje = this.obterDataAtual();

    return pagamento.dataVencimento < hoje;
  }

  private obterDataAtual(): string {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  formatarData(data: string | null): string {
    if (!data) {
      return '—';
    }

    const [ano, mes, dia] = data.substring(0, 10).split('-').map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }

  getDescricaoStatus(pagamento: Pagamento): string {
    if (pagamento.status === 'PAGO') {
      return 'Pago';
    }

    return this.estaAtrasado(pagamento) ? 'Em atraso' : 'Pendente';
  }

  getDescricaoCompetencia(pagamento: Pagamento): string {
    const [ano, mes] = pagamento.competencia
      .substring(0, 7)
      .split('-')
      .map(Number);

    return new Date(ano, mes - 1, 1)
      .toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
  }
}