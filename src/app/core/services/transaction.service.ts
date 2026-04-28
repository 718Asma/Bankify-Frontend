import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TransferPayload,
  DepositPayload,
  WithdrawPayload,
  Transaction,
} from '../models/banking.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly base = `${environment.apiUrl}/api/transactions`;

  constructor(private http: HttpClient) {}

  transfer(payload: TransferPayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/virement`, payload);
  }

  deposit(payload: DepositPayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/depot`, payload);
  }

  withdraw(payload: WithdrawPayload): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/retrait`, payload);
  }
}