import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Compte } from '../../../core/models/banking.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-withdraw',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.css',
})
export class WithdrawComponent implements OnInit {
  form: FormGroup;
  accounts: Compte[] = [];
  loading = false;
  loadingAccounts = true;

  constructor(
    private fb: FormBuilder,
    private txService: TransactionService,
    private accountService: AccountService,
    private notify: NotificationService,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.form = this.fb.group({
      rib:     ['', Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]],
    });
  }

  get rib()     { return this.form.get('rib') as FormControl; }
  get montant() { return this.form.get('montant') as FormControl; }

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => { this.accounts = data.filter(a => a.statut === 'ACTIF'); this.loadingAccounts = false; },
      error: ()    => { this.loadingAccounts = false; },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const data: ConfirmDialogData = {
      title: 'Confirmer le retrait',
      message: `Retirer ${this.montant.value} TND du compte ${this.rib.value} ?`,
      confirmLabel: 'Confirmer',
      variant: 'warn',
    };

    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loading = true;
      this.txService.withdraw(this.rib.value, {
        montant: this.montant.value
      }).subscribe({
        next: () => {
          this.loading = false;
          this.notify.success('Retrait effectué avec succès.');
          this.router.navigate(['/app/accounts']);
        },
        error: (err) => {
          this.loading = false;
          this.notify.error(err.error?.message ?? 'Erreur lors du retrait.');
        },
      });
    });
  }
}