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

  private readonly base = `${environment.apiUrl}/api/comptes`;

  constructor(private http: HttpClient) {}

  transfer(rib: string, payload: TransferPayload): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.base}/${rib}/virement`,
      payload
    );
  }

  deposit(rib: string, payload: DepositPayload): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.base}/${rib}/depot`,
      payload
    );
  }

  withdraw(rib: string, payload: WithdrawPayload): Observable<Transaction> {
    return this.http.post<Transaction>(
      `${this.base}/${rib}/retrait`,
      payload
    );
  }
}