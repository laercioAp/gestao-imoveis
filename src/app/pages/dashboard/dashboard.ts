
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Aluguel, GestaoService } from '../../services/gestao';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  alugueis: Aluguel[] = [];
  competenciaAtual = '2026-10';
  mesAtual = 'Outubro de 2026';
  recebidos = 0;
  pendentes = 0;
  atrasados = 0;

  constructor(private gestaoService: GestaoService) { }

  ngOnInit(): void {
    this.atualizarDashboard();
  }

  atualizarDashboard(): void {
    this.alugueis = this.gestaoService.listar()
      .filter(aluguel => aluguel.competencia === this.competenciaAtual);

    this.recebidos = this.gestaoService.totalRecebido(this.competenciaAtual);
    this.pendentes = this.gestaoService.totalPendente(this.competenciaAtual);
    this.atrasados = this.gestaoService.totalAtrasado(this.competenciaAtual);

    console.log('Competência:', this.competenciaAtual);
    console.log('Aluguéis do dashboard:', this.alugueis);
    console.log('Totais:', {
      recebidos: this.recebidos,
      pendentes: this.pendentes,
      atrasados: this.atrasados
    });
  }

  estaAtrasado(aluguel: Aluguel): boolean {
    return this.gestaoService.estaAtrasado(aluguel);
  }

  formatarData(data: string): string {
    if (!data) return '—';

    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }

  getDescricaoStatus(aluguel: Aluguel): string {
    if (aluguel.status === 'PAGO') return 'Pago';

    return this.estaAtrasado(aluguel) ? 'Em atraso' : 'Pendente';
  }
}