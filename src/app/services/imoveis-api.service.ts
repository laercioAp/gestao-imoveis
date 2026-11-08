
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface Imovel {
  id: number;
  titulo: string;
  tipo: string;
  descricao: string | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
  valorAluguel: number;
  ativo: boolean;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
}

export interface ImovelRequest {
  titulo: string;
  tipo: string;
  descricao: string | null;
  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string;
  cep: string | null;
  valorAluguel: number;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImoveisApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listar(): Observable<Imovel[]> {
    return this.http.get<Imovel[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Imovel> {
    return this.http.get<Imovel>(`${this.apiUrl}/${id}`);
  }

  cadastrar(dados: ImovelRequest): Observable<Imovel> {
    return this.http.post<Imovel>(this.apiUrl, dados);
  }

  atualizar(id: number, dados: ImovelRequest): Observable<Imovel> {
    return this.http.put<Imovel>(`${this.apiUrl}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}