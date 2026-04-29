import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditEntry, AuditFilters } from '../models/agent.models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly base = `${environment.apiUrl}/api/transactions`;

  constructor(private http: HttpClient) {}

  /** Get agent audit log with optional filters */
  getAuditLog(filters: AuditFilters = {}): Observable<AuditEntry[]> {
    let params = new HttpParams();
    if (filters.type)      params = params.set('type',      filters.type);
    if (filters.statut)    params = params.set('statut',    filters.statut);
    if (filters.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters.dateFin)   params = params.set('dateFin',   filters.dateFin);
    if (filters.rib)       params = params.set('rib',       filters.rib);

    return this.http.get<AuditEntry[]>(this.base, { params });
  }
}