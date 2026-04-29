import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../../core/services/account.service';
import { StatementService } from '../../../core/services/statement.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Compte, Transaction, TransactionFilters } from '../../../core/models/banking.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.css',
})
export class AccountDetailComponent implements OnInit {
  account: Compte | null = null;
  transactions: Transaction[] = [];
  loadingAccount  = true;
  loadingTx       = false;
  loadingStatement= false;

  // Pagination
  currentPage  = 0;
  totalPages   = 0;
  totalElements= 0;
  pageSize     = 10;

  // Filters form
  filterForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private accountService: AccountService,
    private statementService: StatementService,
    private notify: NotificationService,
  ) {
    this.filterForm = this.fb.group({
      dateDebut: [''],
      dateFin:   [''],
      type:      [''],
    });
  }

  get rib(): string { return this.route.snapshot.paramMap.get('rib') ?? ''; }

  ngOnInit(): void {
    this.accountService.getAccountById(this.rib).subscribe({
      next: (data) => { this.account = data; this.loadingAccount = false; this.loadTransactions(); },
      error: ()    => { this.loadingAccount = false; this.notify.error('Compte introuvable.'); },
    });
  }

  loadTransactions(page = 0): void {
    this.loadingTx = true;
    const filters: TransactionFilters = {
      ...this.filterForm.value,
      page,
      size: this.pageSize,
    };
    this.accountService.getTransactions(this.rib, filters).subscribe({
      next: (res) => {
        this.transactions  = res.content;
        this.currentPage   = res.number;
        this.totalPages    = res.totalPages;
        this.totalElements = res.totalElements;
        this.loadingTx     = false;
      },
      error: () => { this.loadingTx = false; this.notify.error('Erreur chargement transactions.'); },
    });
  }

  applyFilters(): void { this.loadTransactions(0); }

  resetFilters(): void { this.filterForm.reset({ dateDebut:'', dateFin:'', type:'' }); this.loadTransactions(0); }

  prevPage(): void { if (this.currentPage > 0) this.loadTransactions(this.currentPage - 1); }

  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.loadTransactions(this.currentPage + 1); }

  downloadStatement(): void {
    const { dateDebut, dateFin } = this.filterForm.value;
    if (!dateDebut || !dateFin) { this.notify.error('Sélectionnez une période pour le relevé.'); return; }
    this.loadingStatement = true;
    this.statementService.downloadStatement({ rib: this.rib, dateDebut, dateFin }).subscribe({
      next: (blob) => {
        this.statementService.saveFile(blob, this.rib, dateDebut, dateFin);
        this.loadingStatement = false;
      },
      error: () => { this.loadingStatement = false; this.notify.error('Erreur téléchargement relevé.'); },
    });
  }

  goBack(): void { this.router.navigate(['/app/accounts']); }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  getTxIcon(type: string): string {
    return type === 'VIREMENT' ? 'swap_horiz' : type === 'DEPOT' ? 'add_circle_outline' : 'remove_circle_outline';
  }

  getTxClass(type: string): string {
    return type === 'DEPOT' ? 'tx-credit' : 'tx-debit';
  }

  getStatusClass(statut: string): string {
    return statut === 'EFFECTUE' ? 'status-done' : statut === 'EN_ATTENTE' ? 'status-pending' : 'status-failed';
  }
}