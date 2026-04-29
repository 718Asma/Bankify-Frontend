import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../../core/services/account.service';
import { Compte } from '../../../core/models/banking.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css',
})
export class AccountListComponent implements OnInit {
  accounts: Compte[] = [];
  loading = true;

  constructor(
    private accountService: AccountService,
    private notify: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => { this.accounts = data; this.loading = false; },
      error: ()     => { this.loading = false; this.notify.error('Impossible de charger les comptes.'); },
    });
  }

  goToDetail(rib: string): void {
    this.router.navigate(['/app/accounts', rib]);
  }

  getStatusClass(statut: string): string {
    return statut === 'ACTIF' ? 'status-active' : statut === 'BLOQUE' ? 'status-blocked' : 'status-closed';
  }

  formatSolde(solde: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(solde);
  }
}