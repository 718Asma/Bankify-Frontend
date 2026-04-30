import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientDetail, ClientForm } from '../models/agent.models';

@Injectable({ providedIn: 'root' })
export class ClientAgentService {
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /** Get all clients */
  getAllClients(): Observable<ClientDetail[]> {
      return this.http.get<ClientDetail[]>(`${this.base}/clients/all`);
  }

  /** Create a new client (agent only) */
  createClient(payload: ClientForm): Observable<ClientDetail> {
    return this.http.post<ClientDetail>(`${this.base}/auth/signup`, {
      ...payload,
      userType: 'CLIENT',
      motDePasse: payload.motDePasse ?? 'Bankify@2024', // default password
    });
  }

  /** Get client by CIN */
  getClientByCIN(cin: number): Observable<ClientDetail> {
    return this.http.get<ClientDetail>(`${this.base}/clients/profil/${cin}`);
  }

  /** Update client info */
  updateClient(cin: number, payload: Partial<ClientForm>): Observable<ClientDetail> {
    return this.http.put<ClientDetail>(`${this.base}/clients/profil`, payload);
  }

  /** Search clients */
  searchClients(params: {
    nom?: string;
    prenom?: string;
    email?: string;
    cin?: number;
  }): Observable<ClientDetail[]> {
    return this.http.get<ClientDetail[]>(`${this.base}/clients/rechercher`, {
      params: params as Record<string, string | number>,
    });
  }
}