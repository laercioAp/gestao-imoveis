
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Pagamento {
  id: number;
  contratoId: number;
  imovelId: number;
  imovelTitulo: string;
  inquilinoId: number;
  inquilinoNome: string;
  competencia: string;
  valorPrevisto: number;
  valorPago: number | null;
  dataVencimento: string;
  dataPagamento: string | null;
  formaPagamento: string | null;
  status: 'PENDENTE' | 'PAGO';
  situacaoVencimento: string;
  observacoes: string | null;
  criadoEm: string | null;
  atualizadoEm: string | null;
}

export interface RegistrarPagamentoRequest {
  valorPago: number;
  dataPagamento: string;
  formaPagamento: string;
}

export interface DetalheGeracao {
  contratoId: number;
  resultado: 'GERADO' | 'JA_EXISTENTE' | 'IGNORADO';
  motivo: string;
}

export interface GerarMensalidadeResponse {
  competencia: string;
  quantidadeGerada: number;
  quantidadeJaExistente: number;
  quantidadeContratosIgnorados: number;
  pagamentos: Pagamento[];
  detalhes: DetalheGeracao[];
}

@Injectable({
  providedIn: 'root'
})
export class PagamentosApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pagamentos`;

  listar(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(this.apiUrl);
  }

  listarPendentes(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(
      `${this.apiUrl}/status/PENDENTE`
    );
  }

  buscarPorId(id: number): Observable<Pagamento> {
    return this.http.get<Pagamento>(`${this.apiUrl}/${id}`);
  }

  registrarPagamento(
    id: number,
    dados: RegistrarPagamentoRequest
  ): Observable<Pagamento> {
    return this.http.patch<Pagamento>(
      `${this.apiUrl}/${id}/registrar-pagamento`,
      dados
    );
  }

  gerarMensalidades(
    competencia: string,
    contratoId?: number | null
  ): Observable<GerarMensalidadeResponse> {

    const dados = contratoId
      ? { competencia, contratoId }
      : { competencia };

    return this.http.post<GerarMensalidadeResponse>(
      `${this.apiUrl}/gerar-mensalidade`,
      dados
    );
  }
}