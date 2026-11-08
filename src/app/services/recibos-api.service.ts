import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface ReciboResponse {
    id: number;
    pagamentoId: number;
    numeroRecibo: string;
    dataEmissao: string;
}

@Injectable({
    providedIn: 'root'
})
export class RecibosApiService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    emitir(pagamentoId: number): Observable<ReciboResponse> {
        return this.http.post<ReciboResponse>(
            `${this.apiUrl}/pagamento/${pagamentoId}`,
            null
        );
    }

    baixarPdf(pagamentoId: number): Observable<HttpResponse<Blob>> {
        return this.http.get(
            `${this.apiUrl}/pagamento/${pagamentoId}/pdf`,
            {
                observe: 'response',
                responseType: 'blob'
            }
        );
    }
}