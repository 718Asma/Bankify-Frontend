import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Compte } from '../../../core/models/banking.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, LoadingSpinnerComponent, RouterLink],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css',
})
export class TransferComponent implements OnInit {
  form: FormGroup;
  accounts: Compte[] = [];
  loading     = false;
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
      ribSource:      ['', Validators.required],
      ribDestination: ['', [Validators.required, Validators.minLength(20)]],
      montant:        [null, [Validators.required, Validators.min(1)]],
      description:    [''],
    });
  }

  get ribSource()      { return this.form.get('ribSource') as FormControl; }
  get ribDestination() { return this.form.get('ribDestination') as FormControl; }
  get montant()        { return this.form.get('montant') as FormControl; }

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => { this.accounts = data.filter(a => a.statut === 'ACTIF'); this.loadingAccounts = false; },
      error: ()    => { this.loadingAccounts = false; },
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const data: ConfirmDialogData = {
      title: 'Confirmer le virement',
      message: `Virer ${this.montant.value} TND vers ${this.ribDestination.value} ?`,
      confirmLabel: 'Confirmer',
      variant: 'primary',
    };

    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loading = true;
      this.txService.transfer(this.form.value).subscribe({
        next: () => {
          this.loading = false;
          this.notify.success('Virement effectué avec succès.');
          this.router.navigate(['/app/accounts']);
        },
        error: (err) => {
          this.loading = false;
          this.notify.error(err.error?.message ?? 'Erreur lors du virement.');
        },
      });
    });
  }
}