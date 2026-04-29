import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentStats, AuditEntry, AgentCompte } from '../models/agent.models';

@Injectable({ providedIn: 'root' })
export class AgentStatsService {
  private readonly base = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Build stats from available endpoints.
   * Backend has no dedicated stats endpoint, so we compute from transactions + comptes.
   */
  getStats(): Observable<AgentStats> {
    return forkJoin({
      transactions: this.http.get<AuditEntry[]>(`${this.base}/transactions`),
      comptes:      this.http.get<AgentCompte[]>(`${this.base}/comptes`),
      clients:      this.http.get<any[]>(`${this.base}/clients/rechercher`),
    }).pipe(
      map(({ transactions, comptes, clients }) => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

        // KPIs
        const totalClients = clients.length;
        const comptesOuvertsMois = comptes.filter(
          c => c.dateCreation >= monthStart
        ).length;
        const totalOperations = transactions.length;
        const comptesBlockes = comptes.filter(c => c.status === 'BLOQUE').length;

        // Operations per day (last 30 days)
        const countsByDay: Record<string, number> = {};
        transactions.forEach(t => {
          const day = t.dateRealisation?.split('T')[0] ?? t.dateRealisation;
          if (day) countsByDay[day] = (countsByDay[day] ?? 0) + 1;
        });
        const operationsParJour = Object.entries(countsByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30);

        // Account type breakdown
        const courant = comptes.filter(c => c.type === 'COURANT').length;
        const epargne = comptes.filter(c => c.type === 'EPARGNE').length;
        const repartitionComptes = [
          { type: 'COURANT', count: courant },
          { type: 'EPARGNE', count: epargne },
        ];

        return {
          totalClients,
          comptesOuvertsMois,
          totalOperations,
          comptesBlockes,
          operationsParJour,
          repartitionComptes,
        };
      })
    );
  }
}