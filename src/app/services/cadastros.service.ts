
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Imovel {
  id: number;
  descricao: string;
  tipo: string;
  endereco: string;
  valorAluguel: number;
  diaVencimento: number;
  inquilino: string;
  situacao: 'ALUGADO' | 'DISPONIVEL';
}

export interface Inquilino {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class CadastrosService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // ================================
  // IMÓVEIS
  // ================================

  listarImoveis(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(`${this.apiUrl}/imoveis`);
  }

  buscarImovelPorId(id: number): Observable<Imovel> {
    return this.http.get<Imovel>(`${this.apiUrl}/imoveis/${id}`);
  }

  adicionarImovel(dados: Omit<Imovel, 'id'>): Observable<Imovel> {
    return this.http.post<Imovel>(`${this.apiUrl}/imoveis`, dados);
  }

  atualizarImovel(id: number, dados: Omit<Imovel, 'id'>): Observable<Imovel> {
    return this.http.put<Imovel>(`${this.apiUrl}/imoveis/${id}`, dados);
  }

  excluirImovel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/imoveis/${id}`);
  }

  // ================================
  // INQUILINOS
  // ================================

  listarInquilinos(): Observable<Inquilino[]> {
    return this.http.get<Inquilino[]>(`${this.apiUrl}/inquilinos`);
  }

  buscarInquilinoPorId(id: number): Observable<Inquilino> {
    return this.http.get<Inquilino>(`${this.apiUrl}/inquilinos/${id}`);
  }

  adicionarInquilino(dados: Omit<Inquilino, 'id'>): Observable<Inquilino> {
    return this.http.post<Inquilino>(`${this.apiUrl}/inquilinos`, dados);
  }

  atualizarInquilino(
    id: number,
    dados: Omit<Inquilino, 'id'>
  ): Observable<Inquilino> {
    return this.http.put<Inquilino>(`${this.apiUrl}/inquilinos/${id}`, dados);
  }

  excluirInquilino(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inquilinos/${id}`);
  }
}
