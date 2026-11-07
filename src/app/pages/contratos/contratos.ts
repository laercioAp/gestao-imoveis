
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { jsPDF } from 'jspdf';

import {
  ContratosApiService,
  Contrato,
  ContratoRequest,
  ContratoClausula,
  ContratoClausulaRequest
} from '../../services/contratos-api.service';

import {
  ImoveisApiService,
  Imovel
} from '../../services/imoveis-api.service';

import {
  InquilinosApiService,
  Inquilino
} from '../../services/inquilinos-api.service';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contratos.html',
  styleUrl: './contratos.css'
})
export class Contratos implements OnInit {
  contratos: Contrato[] = [];
  imoveis: Imovel[] = [];
  inquilinos: Inquilino[] = [];

  clausulas: ContratoClausula[] = [];

  mensagem = '';
  tipoMensagem: 'success' | 'danger' | 'info' = 'info';

  carregando = false;
  salvando = false;
  excluindoId: number | null = null;

  mostrarModalExclusao = false;
  contratoSelecionado: Contrato | null = null;

  contratoEditandoId: number | null = null;

  dados = this.formularioVazio();

  constructor(
    private contratosApi: ContratosApiService,
    private imoveisApi: ImoveisApiService,
    private inquilinosApi: InquilinosApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clausulas = this.criarModeloPadrao();
    this.carregarDados();
  }

  private formularioVazio() {
    return {
      imovelId: null as number | null,
      inquilinoId: null as number | null,

      finalidade: 'Residencial',
      valorAluguel: 1800,
      diaVencimento: 10,

      dataInicio: '',
      dataFim: '',

      indiceReajuste: 'IPCA/IBGE',
      valorCaucao: 3600,

      observacoes: '',

      locadorNome: '',
      locadorDocumento: '',
      locadorEndereco: ''
    };
  }

  private criarModeloPadrao(): ContratoClausula[] {
    const modelo: Omit<ContratoClausula, 'id'>[] = [
      {
        ordem: 1,
        titulo: 'DAS PARTES',
        conteudo:
          'O presente contrato é celebrado entre o LOCADOR, devidamente identificado neste instrumento, e o LOCATÁRIO, identificado pelos dados informados no cadastro, que concordam com as condições aqui estabelecidas.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 2,
        titulo: 'DO IMÓVEL E DA DESTINAÇÃO',
        conteudo:
          'O imóvel objeto desta locação é aquele identificado neste contrato, devendo ser utilizado exclusivamente para a finalidade informada, sendo vedada a alteração de destinação sem autorização prévia e expressa do LOCADOR.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 3,
        titulo: 'DA VAGA DE GARAGEM',
        conteudo:
          'A vaga de garagem somente estará incluída na locação quando expressamente identificada e acordada entre as partes. Seu uso deverá respeitar as regras do condomínio.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 4,
        titulo: 'DO PRAZO DA LOCAÇÃO',
        conteudo:
          'A locação terá início na data informada neste instrumento e seguirá até a data final estabelecida ou por prazo indeterminado, conforme os dados do contrato e a legislação aplicável.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 5,
        titulo: 'DO ALUGUEL E DO PAGAMENTO',
        conteudo:
          'O LOCATÁRIO pagará mensalmente o valor do aluguel informado neste contrato, até o dia de vencimento estabelecido, por meio da forma de pagamento acordada entre as partes.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 6,
        titulo: 'DO REAJUSTE',
        conteudo:
          'O valor do aluguel poderá ser reajustado na periodicidade permitida pela legislação, utilizando-se o índice de reajuste informado neste instrumento, ou outro que venha a substituí-lo legalmente.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 7,
        titulo: 'DOS ENCARGOS E DESPESAS',
        conteudo:
          'As despesas de consumo, tributos, condomínio e demais encargos da locação serão suportadas pelas partes conforme a distribuição expressamente acordada e os limites estabelecidos pela legislação aplicável.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 8,
        titulo: 'DAS REGRAS CONDOMINIAIS',
        conteudo:
          'O LOCATÁRIO compromete-se a respeitar a convenção, o regulamento interno e as demais normas válidas do condomínio, respondendo pelas infrações e multas que lhe sejam legalmente atribuíveis.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 9,
        titulo: 'DOS ANIMAIS',
        conteudo:
          'A permanência de animais no imóvel deverá respeitar a legislação aplicável, as regras condominiais válidas e os direitos dos demais moradores, sem prejuízo das responsabilidades do LOCATÁRIO.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 10,
        titulo: 'DA CONSERVAÇÃO E VISTORIA',
        conteudo:
          'O LOCATÁRIO deverá zelar pela conservação do imóvel e devolvê-lo nas condições em que o recebeu, ressalvado o desgaste natural decorrente do uso normal. As condições serão registradas preferencialmente em laudo de vistoria.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 11,
        titulo: 'DAS OBRAS E BENFEITORIAS',
        conteudo:
          'Obras, modificações e benfeitorias deverão observar a legislação e as condições deste contrato. Quando exigida, deverá ser obtida autorização prévia e expressa do LOCADOR.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 12,
        titulo: 'DA CESSÃO E SUBLOCAÇÃO',
        conteudo:
          'A cessão da locação, a transferência do contrato ou a sublocação do imóvel dependerão de autorização prévia e expressa do LOCADOR, observada a legislação aplicável.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 13,
        titulo: 'DA GARANTIA LOCATÍCIA',
        conteudo:
          'A garantia locatícia será aquela expressamente acordada entre as partes. Quando adotada caução em dinheiro, seu valor, depósito, administração e restituição deverão respeitar os requisitos legais.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 14,
        titulo: 'DA RESCISÃO',
        conteudo:
          'A rescisão contratual, os avisos prévios, as multas e demais consequências do encerramento da locação observarão as condições deste instrumento e a legislação aplicável.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 15,
        titulo: 'DA DEVOLUÇÃO DO IMÓVEL',
        conteudo:
          'Ao término da locação, o LOCATÁRIO deverá desocupar e devolver o imóvel e suas chaves, observadas as condições de vistoria, as obrigações pendentes e o desgaste natural pelo uso regular.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 16,
        titulo: 'DO ACESSO PARA VISTORIAS E VISITAS',
        conteudo:
          'O acesso ao imóvel para vistorias, reparos ou visitas deverá ser previamente combinado entre as partes, respeitando a privacidade do LOCATÁRIO e as disposições legais.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 17,
        titulo: 'DO DESCUMPRIMENTO CONTRATUAL',
        conteudo:
          'O descumprimento das obrigações previstas neste contrato poderá acarretar as medidas e consequências legalmente cabíveis, respeitados o contraditório quando aplicável e os direitos de ambas as partes.',
        ativa: true,
        personalizada: false
      },
      {
        ordem: 18,
        titulo: 'DO FORO',
        conteudo:
          'Eventuais controvérsias decorrentes deste contrato serão submetidas ao foro legalmente competente, observadas as regras de competência previstas na legislação.',
        ativa: true,
        personalizada: false
      }
    ];

    return modelo.map(clausula => ({
      ...clausula,
      id: null
    }));
  }

  carregarDados(): void {
    this.carregando = true;
    this.mensagem = '';

    let contratosCarregados = false;
    let imoveisCarregados = false;
    let inquilinosCarregados = false;

    const finalizarCarregamento = (): void => {
      if (
        contratosCarregados &&
        imoveisCarregados &&
        inquilinosCarregados
      ) {
        this.carregando = false;
        this.cdr.detectChanges();
      }
    };

    this.contratosApi.listar()
      .pipe(finalize(() => {
        contratosCarregados = true;
        finalizarCarregamento();
      }))
      .subscribe({
        next: (dados) => {
          this.contratos = dados;
          finalizarCarregamento();
        },
        error: () => {
          this.exibirMensagem(
            'Não foi possível carregar os contratos.',
            'danger'
          );
        }
      });

    this.imoveisApi.listar()
      .pipe(finalize(() => {
        imoveisCarregados = true;
        finalizarCarregamento();
      }))
      .subscribe({
        next: (dados) => {
          this.imoveis = dados.filter(imovel => imovel.ativo);
          finalizarCarregamento();
        },
        error: () => {
          this.exibirMensagem(
            'Não foi possível carregar os imóveis.',
            'danger'
          );
        }
      });

    this.inquilinosApi.listar()
      .pipe(finalize(() => {
        inquilinosCarregados = true;
        finalizarCarregamento();
      }))
      .subscribe({
        next: (dados) => {
          this.inquilinos = dados.filter(inquilino => inquilino.ativo);
          finalizarCarregamento();
        },
        error: () => {
          this.exibirMensagem(
            'Não foi possível carregar os inquilinos.',
            'danger'
          );
        }
      });
  }

  validar(): boolean {
    if (
      !this.dados.imovelId ||
      !this.dados.inquilinoId ||
      !this.dados.finalidade.trim() ||
      !this.dados.dataInicio ||
      this.dados.valorAluguel <= 0 ||
      this.dados.diaVencimento < 1 ||
      this.dados.diaVencimento > 31 ||
      (this.dados.dataFim !== '' &&
        this.dados.dataFim < this.dados.dataInicio) ||
      this.dados.valorCaucao < 0 ||
      !this.dados.locadorNome.trim()
    ) {
      this.exibirMensagem(
        'Confira os campos obrigatórios, os dados do locador, o aluguel, o vencimento e as datas.',
        'danger'
      );
      return false;
    }

    if (this.dados.locadorNome.trim().length > 200) {
      this.exibirMensagem(
        'O nome ou razão social do locador deve ter no máximo 200 caracteres.',
        'danger'
      );
      return false;
    }

    if (this.dados.locadorDocumento.trim().length > 30) {
      this.exibirMensagem(
        'O CPF/CNPJ deve ter no máximo 30 caracteres.',
        'danger'
      );
      return false;
    }

    if (this.clausulas.length === 0) {
      this.exibirMensagem(
        'Adicione pelo menos uma cláusula ao contrato.',
        'danger'
      );
      return false;
    }

    if (this.clausulas.some(clausula =>
      !clausula.titulo.trim() ||
      !clausula.conteudo.trim() ||
      clausula.ordem <= 0
    )) {
      this.exibirMensagem(
        'Confira o título e o conteúdo de todas as cláusulas.',
        'danger'
      );
      return false;
    }

    this.mensagem = '';
    return true;
  }

  private montarRequest(
    status: 'RASCUNHO' | 'ATIVO'
  ): ContratoRequest {
    const clausulas: ContratoClausulaRequest[] =
      this.clausulas.map((clausula, index) => ({
        ordem: index + 1,
        titulo: clausula.titulo.trim(),
        conteudo: clausula.conteudo.trim(),
        ativa: clausula.ativa,
        personalizada: clausula.personalizada
      }));

    return {
      imovelId: Number(this.dados.imovelId),
      inquilinoId: Number(this.dados.inquilinoId),

      finalidade: this.dados.finalidade.trim(),
      valorAluguel: Number(this.dados.valorAluguel),
      diaVencimento: Number(this.dados.diaVencimento),

      dataInicio: this.dados.dataInicio,
      dataFim: this.dados.dataFim || null,

      indiceReajuste: this.dados.indiceReajuste.trim() || null,

      valorCaucao: this.dados.valorCaucao === null
        ? null
        : Number(this.dados.valorCaucao),

      observacoes: this.dados.observacoes.trim() || null,

      locadorNome: this.dados.locadorNome.trim(),
      locadorDocumento: this.dados.locadorDocumento.trim() || null,
      locadorEndereco: this.dados.locadorEndereco.trim() || null,

      status,
      clausulas
    };
  }

  adicionarClausula(): void {
    const novaClausula: ContratoClausula = {
      id: null,
      ordem: this.clausulas.length + 1,
      titulo: 'NOVA CLÁUSULA',
      conteudo: '',
      ativa: true,
      personalizada: true
    };

    this.clausulas.push(novaClausula);
    this.atualizarOrdemClausulas();
  }

  removerClausula(index: number): void {
    if (index < 0 || index >= this.clausulas.length) return;

    this.clausulas.splice(index, 1);
    this.atualizarOrdemClausulas();
  }

  moverClausula(index: number, direcao: -1 | 1): void {
    const novoIndex = index + direcao;

    if (
      index < 0 ||
      novoIndex < 0 ||
      novoIndex >= this.clausulas.length
    ) {
      return;
    }

    const atual = this.clausulas[index];
    this.clausulas[index] = this.clausulas[novoIndex];
    this.clausulas[novoIndex] = atual;

    this.atualizarOrdemClausulas();
  }

  private atualizarOrdemClausulas(): void {
    this.clausulas.forEach((clausula, index) => {
      clausula.ordem = index + 1;
    });
  }

  salvarRascunho(): void {
    this.salvar('RASCUNHO');
  }

  ativarContrato(): void {
    if (!this.validar()) return;

    const confirmar = window.confirm(
      'Deseja salvar este contrato com status ATIVO?'
    );

    if (!confirmar) return;

    this.salvar('ATIVO');
  }

  private salvar(status: 'RASCUNHO' | 'ATIVO'): void {
    if (!this.validar()) return;

    const request = this.montarRequest(status);
    this.salvando = true;

    const operacao = this.contratoEditandoId
      ? this.contratosApi.atualizar(
          this.contratoEditandoId,
          request
        )
      : this.contratosApi.cadastrar(request);

    operacao
      .pipe(finalize(() => {
        this.salvando = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.exibirMensagem(
            status === 'ATIVO'
              ? 'Contrato salvo como ativo.'
              : 'Rascunho salvo com sucesso.',
            'success'
          );

          this.limparFormulario();
          this.carregarContratos();
        },
        error: (erro) => {
          const mensagemErro =
            erro?.error?.message ||
            'Não foi possível salvar o contrato. Confira os dados e tente novamente.';

          this.exibirMensagem(mensagemErro, 'danger');
        }
      });
  }

  editar(contrato: Contrato): void {
    this.contratoEditandoId = contrato.id;

    this.dados = {
      imovelId: contrato.imovelId,
      inquilinoId: contrato.inquilinoId,

      finalidade: contrato.finalidade,
      valorAluguel: Number(contrato.valorAluguel),
      diaVencimento: contrato.diaVencimento,

      dataInicio: contrato.dataInicio,
      dataFim: contrato.dataFim || '',

      indiceReajuste: contrato.indiceReajuste || '',

      valorCaucao: contrato.valorCaucao === null
        ? 0
        : Number(contrato.valorCaucao),

      observacoes: contrato.observacoes || '',

      locadorNome: contrato.locadorNome || '',
      locadorDocumento: contrato.locadorDocumento || '',
      locadorEndereco: contrato.locadorEndereco || ''
    };

    this.clausulas = contrato.clausulas?.length
      ? contrato.clausulas
          .slice()
          .sort((a, b) => a.ordem - b.ordem)
          .map(clausula => ({ ...clausula }))
      : this.criarModeloPadrao();

    this.exibirMensagem(
      `Editando o contrato ${contrato.id}.`,
      'info'
    );

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluir(contrato: Contrato): void {
    if (this.excluindoId !== null) return;

    this.contratoSelecionado = contrato;
    this.mensagem = '';
    this.mostrarModalExclusao = true;

    this.cdr.detectChanges();
  }

  cancelarExclusao(): void {
    if (this.excluindoId !== null) return;

    this.mostrarModalExclusao = false;
    this.contratoSelecionado = null;

    this.cdr.detectChanges();
  }

  confirmarExclusao(): void {
    if (!this.contratoSelecionado || this.excluindoId !== null) return;

    const id = this.contratoSelecionado.id;

    this.excluindoId = id;

    this.contratosApi.excluir(id)
      .pipe(finalize(() => {
        this.excluindoId = null;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.mostrarModalExclusao = false;
          this.contratoSelecionado = null;

          this.exibirMensagem(
            'Contrato excluído com sucesso.',
            'success'
          );

          this.carregarContratos();
        },
        error: (erro) => {
          this.mostrarModalExclusao = false;
          this.contratoSelecionado = null;

          this.exibirMensagem(
            erro?.error?.message ||
            'Não foi possível excluir o contrato. Verifique se existem pagamentos vinculados.',
            'danger'
          );
        }
      });
  }

  carregarContratos(): void {
    this.contratosApi.listar().subscribe({
      next: (dados) => {
        this.contratos = dados;
        this.cdr.detectChanges();
      },
      error: () => {
        this.exibirMensagem(
          'Erro ao atualizar a lista de contratos.',
          'danger'
        );
      }
    });
  }

  limparFormulario(): void {
    this.dados = this.formularioVazio();
    this.clausulas = this.criarModeloPadrao();
    this.contratoEditandoId = null;
  }

  cancelarEdicao(): void {
    this.limparFormulario();
    this.exibirMensagem('Edição cancelada.', 'info');
  }

  gerarPdf(): void {
    if (!this.validar()) return;

    const clausulasAtivas = this.clausulas
      .filter(clausula => clausula.ativa)
      .sort((a, b) => a.ordem - b.ordem);

    if (clausulasAtivas.length === 0) {
      this.exibirMensagem(
        'Ative pelo menos uma cláusula para gerar o contrato.',
        'danger'
      );
      return;
    }

    const imovel = this.imoveis.find(
      item => item.id === Number(this.dados.imovelId)
    );

    const inquilino = this.inquilinos.find(
      item => item.id === Number(this.dados.inquilinoId)
    );

    if (!imovel || !inquilino) {
      this.exibirMensagem(
        'Selecione um imóvel e um inquilino válidos.',
        'danger'
      );
      return;
    }

    const doc = new jsPDF();

    const margem = 18;
    const larguraPagina = doc.internal.pageSize.getWidth();
    const largura = larguraPagina - margem * 2;

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

    const enderecoImovel = [
      imovel.endereco,
      imovel.numero,
      imovel.complemento,
      imovel.bairro,
      imovel.cidade,
      imovel.estado,
      imovel.cep
    ].filter(Boolean).join(', ');

    const documentoLocador = this.dados.locadorDocumento.trim()
      ? `, CPF/CNPJ ${this.dados.locadorDocumento.trim()}`
      : '';

    const enderecoLocador = this.dados.locadorEndereco.trim()
      ? `, com endereço em ${this.dados.locadorEndereco.trim()}`
      : '';

    // =========================================
    // CABEÇALHO CENTRALIZADO DO CONTRATO
    // =========================================

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);

    doc.text(
      'CONTRATO PARTICULAR DE LOCAÇÃO DE IMÓVEL',
      larguraPagina / 2,
      y,
      { align: 'center' }
    );

    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    doc.text(
      this.dados.finalidade.toUpperCase(),
      larguraPagina / 2,
      y,
      { align: 'center' }
    );

    y += 12;

    // =========================================
    // CONTEÚDO DO CONTRATO
    // =========================================

    escrever('DAS PARTES', 11, true);

    escrever(
      `LOCADOR: ${this.dados.locadorNome.trim()}` +
      `${documentoLocador}${enderecoLocador}.`
    );

    escrever(
      `LOCATÁRIO(A): ${inquilino.nome}, CPF ${inquilino.cpf}.`
    );

    escrever('DO IMÓVEL E DA DESTINAÇÃO', 11, true);

    escrever(
      `O imóvel ${imovel.titulo}, situado em ${enderecoImovel}, ` +
      `destina-se à utilização ${this.dados.finalidade.toLowerCase()}.`
    );

    escrever('DAS CONDIÇÕES CONTRATUAIS', 11, true);

    escrever(
      `Prazo: início em ${this.formatarData(this.dados.dataInicio)} ` +
      `e término em ${this.dados.dataFim
        ? this.formatarData(this.dados.dataFim)
        : 'prazo indeterminado'}.`
    );

    escrever(
      `Aluguel mensal: ${moeda(Number(this.dados.valorAluguel))}. ` +
      `Vencimento: dia ${this.dados.diaVencimento}.`
    );

    escrever(
      `Índice de reajuste: ${this.dados.indiceReajuste || 'não informado'}.`
    );

    escrever(
      `Caução informada: ${moeda(Number(this.dados.valorCaucao || 0))}.`
    );

    escrever('CLÁUSULAS CONTRATUAIS', 11, true);

    clausulasAtivas.forEach((clausula, index) => {
      escrever(
        `${index + 1}. ${clausula.titulo.trim()}`,
        10,
        true
      );

      escrever(clausula.conteudo.trim());
    });

    if (this.dados.observacoes.trim()) {
      escrever('OBSERVAÇÕES ADICIONAIS', 11, true);
      escrever(this.dados.observacoes.trim());
    }

    y += 8;

    escrever(
      'E, estando de acordo com as condições estabelecidas, ' +
      'as partes assinam o presente instrumento.'
    );

    escrever(
      `Data: ${this.formatarData(
        new Date().toISOString().slice(0, 10)
      )}`
    );

    y += 10;

    escrever('________________________________________');
    escrever(`LOCADOR: ${this.dados.locadorNome.trim()}`);

    y += 5;

    escrever('________________________________________');
    escrever(`LOCATÁRIO(A): ${inquilino.nome}`);

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

  private exibirMensagem(
    mensagem: string,
    tipo: 'success' | 'danger' | 'info'
  ): void {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    this.cdr.detectChanges();
  }
}
