
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  ContratosApiService,
  Contrato,
  ContratoRequest
} from './contratos-api.service';

export type StatusContrato = 'RASCUNHO' | 'ATIVO';

export interface ContratoLocacao {
  id: number;
  locadorNome: string;
  locadorCpf: string;
  locadorEndereco: string;
  inquilinoNome: string;
  inquilinoCpf: string;
  inquilinoEndereco: string;
  imovelEndereco: string;
  finalidade: string;
  valorAluguel: number;
  diaVencimento: number;
  dataInicio: string;
  dataFim: string;
  indiceReajuste: string;
  valorCaucao: number;
  observacoes: string;
  status: StatusContrato;
  criadoEm: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContratosService {
  private readonly contratosApi = inject(ContratosApiService);

  listar(): Observable<Contrato[]> {
    return this.contratosApi.listar();
  }

  buscarPorId(id: number): Observable<Contrato> {
    return this.contratosApi.buscarPorId(id);
  }

  listarPorStatus(status: StatusContrato): Observable<Contrato[]> {
    return this.contratosApi.listarPorStatus(status);
  }

  salvarContrato(dados: ContratoRequest): Observable<Contrato> {
    return this.contratosApi.cadastrar(dados);
  }

  atualizarContrato(
    id: number,
    dados: ContratoRequest
  ): Observable<Contrato> {
    return this.contratosApi.atualizar(id, dados);
  }

  excluir(id: number): Observable<void> {
    return this.contratosApi.excluir(id);
  }
}
