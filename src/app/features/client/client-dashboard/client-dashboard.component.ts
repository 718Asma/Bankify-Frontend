import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Compte, Transaction } from '../../../core/models/banking.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

declare const Chart: any;

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css',
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  accounts: Compte[] = [];
  recentTransactions: Transaction[] = [];
  loading = true;
  private destroy$ = new Subject<void>();
  private chart: any = null;

  // Computed metrics
  totalBalance = 0;
  accountCount = 0;
  lastTxDate: string | null = null;
  txCounts = { VIREMENT: 0, DEPOT: 0, RETRAIT: 0 };

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private notifService: NotificationApiService,
    private auth: AuthService,
    private router: Router,
  ) {}

  get userName(): string {
    const u = this.auth.getCurrentUser();
    return u ? u.prenom : '';
  }

  ngOnInit(): void {
    forkJoin({
      accounts: this.accountService.getAccounts(),
      transactions: this.transactionService.getMesTransactions(),
      notifications: this.notifService.loadNotifications(),
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ accounts, transactions }) => {
        // Accounts
        this.accounts = accounts;
        this.totalBalance = accounts.reduce((s, a) => s + a.solde, 0);
        this.accountCount = accounts.length;

        // Transactions
        this.recentTransactions = transactions.slice(0, 5);
        this.lastTxDate = this.recentTransactions[0]?.date ?? null;
        this.computeChartData(transactions);

        this.loading = false;
        setTimeout(() => this.renderChart(), 50);
      },
      error: () => { this.loading = false; },
    });
  }

  private computeChartData(txs: Transaction[]): void {
    this.txCounts = { VIREMENT: 0, DEPOT: 0, RETRAIT: 0 };
    txs.forEach(t => {
      if (t.type in this.txCounts) this.txCounts[t.type as keyof typeof this.txCounts]++;
    });
  }

  private renderChart(): void {
    const canvas = document.getElementById('spendingChart') as HTMLCanvasElement;
    if (!canvas || typeof Chart === 'undefined') return;
    if (this.chart) this.chart.destroy();

    const total = this.txCounts.VIREMENT + this.txCounts.DEPOT + this.txCounts.RETRAIT;
    if (total === 0) return;

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Virements', 'Dépôts', 'Retraits'],
        datasets: [{
          data: [this.txCounts.VIREMENT, this.txCounts.DEPOT, this.txCounts.RETRAIT],
          backgroundColor: ['#1a3a4a', '#C9A84C', '#e74c3c'],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Roboto', size: 12 },
              color: '#5a6475',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} opération(s)`,
            },
          },
        },
      },
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  getTxClass(type: string): string {
    return type === 'DEPOT' ? 'tx-credit' : 'tx-debit';
  }

  getTxIcon(type: string): string {
    return type === 'VIREMENT' ? 'swap_horiz' : type === 'DEPOT' ? 'add_circle_outline' : 'remove_circle_outline';
  }

  getStatusClass(statut: string): string {
    return statut === 'ACTIF' ? 'st-actif' : statut === 'BLOQUE' ? 'st-bloque' : 'st-ferme';
  }

  goToAccount(rib: string): void {
    this.router.navigate(['/app/accounts', rib]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) this.chart.destroy();
  }
}