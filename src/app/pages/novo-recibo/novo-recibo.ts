
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import { Aluguel, GestaoService } from '../../services/gestao';

@Component({
  selector: 'app-novo-recibo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './novo-recibo.html',
  styleUrl: './novo-recibo.css'
})
export class NovoRecibo {
  alugueisPendentes: Aluguel[] = [];
  aluguelSelecionadoId = '';
  dataPagamento = this.hojeLocal();
  formaPagamento = 'PIX';
  mensagemErro = '';

  constructor(
    private gestaoService: GestaoService,
    private router: Router
  ) {
    this.carregarPendentes();
  }

  private carregarPendentes(): void {
    this.alugueisPendentes = this.gestaoService
      .listar()
      .filter(aluguel => aluguel.status === 'PENDENTE');
  }

  get aluguelSelecionado(): Aluguel | undefined {
    if (!this.aluguelSelecionadoId) return undefined;

    return this.gestaoService.buscarPorId(Number(this.aluguelSelecionadoId));
  }

  hojeLocal(): string {
    const hoje = new Date();

    return [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0')
    ].join('-');
  }

  formatarData(data: string): string {
    if (!data) return '—';

    const [ano, mes, dia] = data.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
  }

  registrarPagamento(): void {
    this.mensagemErro = '';

    const aluguel = this.aluguelSelecionado;

    if (!aluguel) {
      this.mensagemErro = 'Selecione um aluguel pendente.';
      return;
    }

    if (!this.dataPagamento || !this.formaPagamento) {
      this.mensagemErro = 'Informe a data e a forma de pagamento.';
      return;
    }

    try {
      const pagamento = this.gestaoService.registrarPagamento(
        aluguel.id,
        this.dataPagamento,
        this.formaPagamento
      );

      this.gerarPdf(pagamento);

      // Atualiza a lista de pendências após o registro.
      this.carregarPendentes();

      // Volta ao dashboard depois de gerar o recibo.
      this.router.navigate(['/inicio']);
    } catch (erro) {
      this.mensagemErro = erro instanceof Error
        ? erro.message
        : 'Não foi possível registrar o pagamento.';
    }
  }

  private gerarPdf(aluguel: Aluguel): void {
    const pdf = new jsPDF();
    const azul = '#20365B';
    const valorFormatado = aluguel.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    pdf.setFillColor(32, 54, 91);
    pdf.rect(0, 0, 210, 39, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(19);
    pdf.text('RECIBO DE ALUGUEL', 20, 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nº ${aluguel.numeroRecibo ?? 'REC-' + aluguel.id}`, 20, 29);

    pdf.setTextColor(32, 54, 91);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('COMPROVANTE DE PAGAMENTO', 20, 55);

    pdf.setDrawColor(220, 226, 235);
    pdf.line(20, 61, 190, 61);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(55, 65, 81);

    pdf.text('Locador: Laercio Aparecido Pedroso', 20, 75);
    pdf.text(`Imóvel: ${aluguel.imovel}`, 20, 87);
    pdf.text(`Inquilino: ${aluguel.inquilino}`, 20, 99);
    pdf.text(`Competência: ${aluguel.competencia}`, 20, 111);
    pdf.text(`Vencimento: ${this.formatarData(aluguel.vencimento)}`, 20, 123);
    pdf.text(`Data do pagamento: ${this.formatarData(aluguel.dataPagamento ?? '')}`, 20, 135);
    pdf.text(`Forma de pagamento: ${aluguel.formaPagamento ?? 'Não informada'}`, 20, 147);

    pdf.setFillColor(242, 245, 250);
    pdf.roundedRect(20, 160, 170, 25, 3, 3, 'F');

    pdf.setTextColor(32, 54, 91);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text(`VALOR RECEBIDO: ${valorFormatado}`, 27, 176);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(85, 95, 110);
    pdf.text(
      'Declaro o recebimento do valor acima referente à locação informada.',
      20,
      202,
      { maxWidth: 170 }
    );

    pdf.setDrawColor(130, 140, 155);
    pdf.line(40, 242, 170, 242);

    pdf.setTextColor(55, 65, 81);
    pdf.setFontSize(10);
    pdf.text('Laercio Aparecido Pedroso - Locador', 105, 250, {
      align: 'center'
    });

    pdf.setTextColor(100, 110, 125);
    pdf.setFontSize(8);
    pdf.text('Recibo gerado pelo Sistema de Gestão de Aluguéis', 105, 280, {
      align: 'center'
    });

    // O nome do arquivo evita espaços e caracteres especiais.
    pdf.save(`${aluguel.numeroRecibo ?? 'recibo-' + aluguel.id}.pdf`);
  }
}