import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.http.get<any[]>(`${this.base}/comptes/mes-comptes`).pipe(
      map(comptes => comptes.map(c => this.mapCompte(c)))
    );
  }

  /** Get single account by RIB */
  getAccountById(rib: string): Observable<Compte> {
    return this.http.get<any>(`${this.base}/comptes/${rib}/details`).pipe(
      map(c => this.mapCompte(c))
    );
  }

  /** Get transactions for an account with optional filters */
  getTransactions(
    rib: string,
    filters: TransactionFilters = {}
  ): Observable<PagedResponse<Transaction>> {
    let params = new HttpParams();
    params = params.set('rib', rib);
    if (filters.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters.dateFin)   params = params.set('dateFin',   filters.dateFin);
    if (filters.type)      params = params.set('type',      filters.type);

    // Backend returns a plain List<TransactionResponse>, we wrap it into a PagedResponse
    return this.http.get<any[]>(`${this.base}/transactions`, { params }).pipe(
      map(list => {
        const transactions = (list ?? []).map(t => this.mapTransaction(t));
        // Apply client-side pagination if requested
        const page = filters.page ?? 0;
        const size = filters.size ?? transactions.length;
        const start = page * size;
        const content = transactions.slice(start, start + size);
        return {
          content,
          totalElements: transactions.length,
          totalPages: Math.ceil(transactions.length / (size || 1)),
          number: page,
        } as PagedResponse<Transaction>;
      })
    );
  }

  // --- Mappers: align backend field names with frontend model ---

  private mapCompte(c: any): Compte {
    return {
      rib:         c.rib,
      solde:       c.solde,
      dateCreation: c.dateCreation,
      type:        c.type,
      // backend uses "status", frontend model uses "statut"
      statut:      c.status ?? c.statut,
      clientCin:   c.clientCin,
    } as Compte;
  }

  private mapTransaction(t: any): Transaction {
    return {
      id:      t.id,
      type:    t.type,
      // backend uses "dateRealisation", frontend model uses "date"
      date:    t.dateRealisation ?? t.date,
      montant: t.montant,
      statut:  t.statut,
    } as Transaction;
  }
}