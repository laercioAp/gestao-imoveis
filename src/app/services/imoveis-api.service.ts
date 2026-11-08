
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Inquilino {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  ativo: boolean;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
}

export interface InquilinoRequest {
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InquilinosApiService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inquilinos`;

  listar(): Observable<Inquilino[]> {
    return this.http.get<Inquilino[]>(this.apiUrl);
  }

  listarAtivos(): Observable<Inquilino[]> {
    return this.http.get<Inquilino[]>(`${this.apiUrl}/ativos`);
  }

  buscarPorId(id: number): Observable<Inquilino> {
    return this.http.get<Inquilino>(`${this.apiUrl}/${id}`);
  }

  cadastrar(dados: InquilinoRequest): Observable<Inquilino> {
    return this.http.post<Inquilino>(this.apiUrl, dados);
  }

  atualizar(
    id: number,
    dados: InquilinoRequest
  ): Observable<Inquilino> {
    return this.http.put<Inquilino>(`${this.apiUrl}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}