
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContratoClausula {
  id?: number | null;
  ordem: number;
  titulo: string;
  conteudo: string;
  ativa: boolean;
  personalizada: boolean;
}

export interface Contrato {
  id: number;

  imovelId: number;
  imovelTitulo: string;

  inquilinoId: number;
  inquilinoNome: string;
  inquilinoCpf: string;

  finalidade: string;
  valorAluguel: number;
  diaVencimento: number;

  dataInicio: string;
  dataFim: string | null;

  indiceReajuste: string | null;
  valorCaucao: number | null;
  observacoes: string | null;

  locadorNome: string | null;
  locadorDocumento: string | null;
  locadorEndereco: string | null;

  status: 'RASCUNHO' | 'ATIVO' | 'ENCERRADO';

  criadoEm: string | null;
  atualizadoEm: string | null;

  clausulas: ContratoClausula[];
}

export interface ContratoClausulaRequest {
  ordem: number;
  titulo: string;
  conteudo: string;
  ativa: boolean;
  personalizada: boolean;
}

export interface ContratoRequest {
  imovelId: number;
  inquilinoId: number;

  finalidade: string;
  valorAluguel: number;
  diaVencimento: number;

  dataInicio: string;
  dataFim: string | null;

  indiceReajuste: string | null;
  valorCaucao: number | null;
  observacoes: string | null;

  locadorNome: string;
  locadorDocumento: string | null;
  locadorEndereco: string | null;

  status: Contrato['status'];

  clausulas: ContratoClausulaRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class ContratosApiService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/contratos`;

  listar(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.apiUrl}/${id}`);
  }

  listarPorStatus(status: Contrato['status']): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(
      `${this.apiUrl}/status/${status}`
    );
  }

  listarPorImovel(imovelId: number): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(
      `${this.apiUrl}/imovel/${imovelId}`
    );
  }

  listarPorInquilino(inquilinoId: number): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(
      `${this.apiUrl}/inquilino/${inquilinoId}`
    );
  }

  cadastrar(dados: ContratoRequest): Observable<Contrato> {
    return this.http.post<Contrato>(this.apiUrl, dados);
  }

  atualizar(id: number, dados: ContratoRequest): Observable<Contrato> {
    return this.http.put<Contrato>(
      `${this.apiUrl}/${id}`,
      dados
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
