import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentCompte, OpenAccountForm } from '../models/agent.models';

@Injectable({ providedIn: 'root' })
export class AgentAccountService {
  private readonly base = `${environment.apiUrl}/api/comptes`;

  constructor(private http: HttpClient) {}

  /** Open a new account for a client */
  openAccount(payload: OpenAccountForm): Observable<AgentCompte> {
    return this.http.post<AgentCompte>(this.base, payload);
  }

  /** Block an account */
  blockAccount(rib: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${rib}/bloquer`, {});
  }

  /** Unblock an account */
  unblockAccount(rib: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${rib}/debloquer`, {});
  }

  /** Close an account */
  closeAccount(rib: string): Observable<void> {
    return this.http.put<void>(`${this.base}/${rib}/fermer`, {});
  }

  /** Get account by RIB */
  getAccount(rib: string): Observable<AgentCompte> {
    return this.http.get<AgentCompte>(`${this.base}/${rib}/details`);
  }

  /** Get all accounts for a client */
  getClientAccounts(cin: number): Observable<AgentCompte[]> {
    return this.http.get<AgentCompte[]>(`${this.base}/${cin}`);
  }
}