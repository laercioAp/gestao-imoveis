
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

import {
  ContratosService,
  ContratoLocacao,
  StatusContrato
} from '../../services/contratos';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})
export class Contratos {
  contratos: ContratoLocacao[] = [];
  mensagem = '';

  dados = this.formularioVazio();

  constructor(private contratosService: ContratosService) {
    this.carregar();
  }

  private formularioVazio() {
    return {
      locadorNome: '',
      locadorCpf: '',
      locadorEndereco: '',
      inquilinoNome: '',
      inquilinoCpf: '',
      inquilinoEndereco: '',
      imovelEndereco: '',
      finalidade: 'Residencial',
      valorAluguel: 1800,
      diaVencimento: 10,
      dataInicio: '',
      dataFim: '',
      indiceReajuste: 'IPCA/IBGE',
      valorCaucao: 3600,
      observacoes: ''
    };
  }

  carregar(): void {
    this.contratos = this.contratosService.listar();
  }

  validar(): boolean {
    if (
      !this.dados.locadorNome.trim() ||
      !this.dados.locadorCpf.trim() ||
      !this.dados.locadorEndereco.trim() ||
      !this.dados.inquilinoNome.trim() ||
      !this.dados.inquilinoCpf.trim() ||
      !this.dados.inquilinoEndereco.trim() ||
      !this.dados.imovelEndereco.trim() ||
      !this.dados.dataInicio ||
      !this.dados.dataFim ||
      this.dados.valorAluguel <= 0 ||
      this.dados.diaVencimento < 1 ||
      this.dados.diaVencimento > 31 ||
      this.dados.dataFim <= this.dados.dataInicio
    ) {
      this.mensagem =
        'Confira os dados obrigatórios, o aluguel e as datas do contrato.';
      return false;
    }

    this.mensagem = '';
    return true;
  }

  private prepararDados(
    status: StatusContrato
  ): Omit<ContratoLocacao, 'id' | 'criadoEm'> {
    return {
      ...this.dados,
      locadorNome: this.dados.locadorNome.trim(),
      locadorCpf: this.dados.locadorCpf.trim(),
      locadorEndereco: this.dados.locadorEndereco.trim(),
      inquilinoNome: this.dados.inquilinoNome.trim(),
      inquilinoCpf: this.dados.inquilinoCpf.trim(),
      inquilinoEndereco: this.dados.inquilinoEndereco.trim(),
      imovelEndereco: this.dados.imovelEndereco.trim(),
      status
    };
  }

  salvarRascunho(): void {
    if (!this.validar()) return;

    this.contratosService.salvarContrato(
      this.prepararDados('RASCUNHO')
    );

    this.carregar();
    this.mensagem = 'Rascunho salvo. Nenhuma cobrança foi criada.';
  }

  ativarContrato(): void {
    if (!this.validar()) return;

    const confirmar = window.confirm(
      'Deseja salvar este contrato com status ATIVO? ' +
      'Nesta versão, isso não cria cobranças nem vincula cadastros automaticamente.'
    );

    if (!confirmar) return;

    this.contratosService.salvarContrato(
      this.prepararDados('ATIVO')
    );

    this.carregar();
    this.mensagem =
      'Contrato salvo como ativo. Gere o PDF e confira os dados antes de assinar.';
  }

  gerarPdf(): void {
    if (!this.validar()) return;

    const doc = new jsPDF();
    const margem = 18;
    const largura = 174;
    let y = 20;

    const escrever = (
      texto: string,
      tamanho = 10,
      negrito = false
    ): void => {
      doc.setFont('helvetica', negrito ? 'bold' : 'normal');
      doc.setFontSize(tamanho);

      const linhas = doc.splitTextToSize(texto, largura);
      const altura = linhas.length * tamanho * 0.48 + 3;

      if (y + altura > 275) {
        doc.addPage();
        y = 20;
      }

      doc.text(linhas, margem, y);
      y += altura;
    };

    const moeda = (valor: number): string =>
      valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });

    escrever('CONTRATO PARTICULAR DE LOCAÇÃO DE IMÓVEL', 14, true);
    escrever(this.dados.finalidade.toUpperCase(), 12, true);
    y += 4;

    escrever('1. DAS PARTES', 11, true);
    escrever(
      `LOCADOR: ${this.dados.locadorNome}, CPF ${this.dados.locadorCpf}, ` +
      `residente em ${this.dados.locadorEndereco}.`
    );
    escrever(
      `LOCATÁRIO(A): ${this.dados.inquilinoNome}, CPF ` +
      `${this.dados.inquilinoCpf}, residente em ${this.dados.inquilinoEndereco}.`
    );

    escrever('2. DO IMÓVEL E DA DESTINAÇÃO', 11, true);
    escrever(
      `O imóvel situado em ${this.dados.imovelEndereco} destina-se ` +
      `à utilização ${this.dados.finalidade.toLowerCase()}.`
    );

    escrever('3. DA VAGA DE GARAGEM', 11, true);
    escrever(
      'A vaga de garagem não está incluída nesta locação, salvo se ' +
      'expressamente descrita e acordada por escrito entre as partes.'
    );

    escrever('4. DO PRAZO', 11, true);
    escrever(
      `O prazo acordado inicia-se em ${this.formatarData(this.dados.dataInicio)} ` +
      `e termina em ${this.formatarData(this.dados.dataFim)}.`
    );

    escrever('5. DO ALUGUEL, VENCIMENTO E PAGAMENTO', 11, true);
    escrever(
      `O aluguel mensal é de ${moeda(this.dados.valorAluguel)}, ` +
      `com vencimento todo dia ${this.dados.diaVencimento} de cada mês. ` +
      'O meio de pagamento e os dados bancários deverão ser confirmados entre as partes.'
    );

    escrever('6. DO REAJUSTE ANUAL', 11, true);
    escrever(
      `O reajuste será anual, conforme o índice ${this.dados.indiceReajuste}, ` +
      'observada a legislação aplicável.'
    );

    escrever('7. DOS ENCARGOS, CONDOMÍNIO E IPTU', 11, true);
    escrever(
      'A responsabilidade pelas despesas de consumo, condomínio, IPTU e demais ' +
      'encargos deverá seguir a distribuição expressamente acordada no contrato ' +
      'e a legislação aplicável.'
    );

    escrever('8. DAS REGRAS CONDOMINIAIS E MULTAS', 11, true);
    escrever(
      'O locatário deverá cumprir as regras do condomínio e responder pelas ' +
      'multas que lhe sejam legalmente atribuíveis, após comprovação.'
    );

    escrever('9. DOS ANIMAIS', 11, true);
    escrever(
      'As regras sobre animais deverão respeitar a legislação aplicável, ' +
      'as normas condominiais válidas e os direitos das partes.'
    );

    escrever('10. DA CONSERVAÇÃO, VISTORIA E REPAROS', 11, true);
    escrever(
      'O estado do imóvel deverá ser registrado em vistoria inicial. ' +
      'Cada parte responderá pelas obrigações que lhe couberem por lei e contrato.'
    );

    escrever('11. DAS OBRAS E BENFEITORIAS', 11, true);
    escrever(
      'Obras e alterações deverão observar o contrato, a legislação e, ' +
      'quando necessário, autorização prévia por escrito.'
    );

    escrever('12. DA CESSÃO E SUBLOCAÇÃO', 11, true);
    escrever(
      'A cessão ou sublocação deverá observar as condições contratuais ' +
      'e a legislação aplicável.'
    );

    escrever('13. DA GARANTIA — CAUÇÃO', 11, true);
    escrever(
      `Caução prevista: ${moeda(this.dados.valorCaucao)}. ` +
      'A forma de depósito, restituição e demais condições devem obedecer ' +
      'à legislação aplicável e ser formalizadas pelas partes.'
    );

    escrever('14. DA RESCISÃO', 11, true);
    escrever(
      'A rescisão, os avisos prévios e eventuais multas observarão as ' +
      'condições contratadas e as hipóteses previstas em lei.'
    );

    escrever('15. DA DEVOLUÇÃO DO IMÓVEL E DAS CHAVES', 11, true);
    escrever(
      'Na desocupação, o imóvel e as chaves serão devolvidos conforme ' +
      'o contrato, consideradas as condições da vistoria e o desgaste normal.'
    );

    escrever('16. DO ACESSO PARA VISTORIA E VISITAS', 11, true);
    escrever(
      'As vistorias e visitas deverão ser combinadas previamente, ' +
      'respeitando os direitos das partes.'
    );

    escrever('17. DO DESCUMPRIMENTO E DISPOSIÇÕES GERAIS', 11, true);
    escrever(
      'Alterações deverão ser formalizadas por escrito. O descumprimento ' +
      'será tratado conforme o contrato e a legislação aplicável.'
    );

    escrever('18. DO FORO', 11, true);
    escrever(
      'Fica indicado o foro legalmente competente para resolver eventuais ' +
      'controvérsias relacionadas à locação.'
    );

    if (this.dados.observacoes.trim()) {
      escrever('OBSERVAÇÕES ADICIONAIS', 11, true);
      escrever(this.dados.observacoes.trim());
    }

    y += 8;
    escrever('E, estando de acordo, as partes assinam o presente instrumento.');
    escrever(`Data: ${this.formatarData(new Date().toISOString().slice(0, 10))}`);
    y += 10;
    escrever('________________________________________');
    escrever(`LOCADOR: ${this.dados.locadorNome}`);
    y += 5;
    escrever('________________________________________');
    escrever(`LOCATÁRIO(A): ${this.dados.inquilinoNome}`);
    y += 5;
    escrever('________________________________________');
    escrever('TESTEMUNHA 1 — Nome e CPF');
    y += 5;
    escrever('________________________________________');
    escrever('TESTEMUNHA 2 — Nome e CPF');

    doc.save('contrato-locacao.pdf');
  }

  private formatarData(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  excluir(id: number): void {
    if (!window.confirm('Deseja excluir este contrato?')) return;

    this.contratosService.excluir(id);
    this.carregar();
  }
}