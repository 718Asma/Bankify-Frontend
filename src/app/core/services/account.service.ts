import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Compte,
  Transaction,
  TransactionFilters,
  PagedResponse,
} from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /** Get all accounts for logged-in client */
  getAccounts(): Observable<Compte[]> {
    return this.http.get<Compte[]>(`${this.base}/comptes`);
  }

  /** Get single account by RIB */
  getAccountById(rib: string): Observable<Compte> {
    return this.http.get<Compte>(`${this.base}/comptes/${rib}`);
  }

  /** Get transactions for an account with optional filters + pagination */
  getTransactions(
    rib: string,
    filters: TransactionFilters = {}
  ): Observable<PagedResponse<Transaction>> {
    let params = new HttpParams();
    if (filters.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters.dateFin)   params = params.set('dateFin',   filters.dateFin);
    if (filters.type)      params = params.set('type',      filters.type);
    if (filters.page != null) params = params.set('page', filters.page.toString());
    if (filters.size != null) params = params.set('size', filters.size.toString());

    return this.http.get<PagedResponse<Transaction>>(
      `${this.base}/comptes/${rib}/transactions`,
      { params }
    );
  }
}