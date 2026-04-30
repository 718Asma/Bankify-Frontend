import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AgentAccountService } from '../../../core/services/agent-account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AgentCompte } from '../../../core/models/agent.models';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css',
})
export class AccountManagementComponent implements OnInit {
  account: AgentCompte | null = null;
  loadingData    = true;
  loadingAction  = false;

  // Close account dialog state
  showCloseDialog  = false;
  loadingClose     = false;
  closeError       = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AgentAccountService,
    private notify: NotificationService,
    private dialog: MatDialog,
  ) {}

  get rib(): string {
    return this.route.snapshot.paramMap.get('rib') ?? '';
  }

  ngOnInit(): void {
    this.accountService.getAccount(this.rib).subscribe({
      next: (data) => { this.account = data; this.loadingData = false; },
      error: () => {
        this.loadingData = false;
        this.notify.error('Compte introuvable.');
        this.router.navigate(['/app/agent/clients']);
      },
    });
  }

  blockAccount(): void {
    const data: ConfirmDialogData = {
      title: 'Bloquer le compte',
      message: `Êtes-vous sûr de vouloir bloquer le compte ${this.rib} ? Le client ne pourra plus effectuer d'opérations.`,
      confirmLabel: 'Bloquer',
      variant: 'warn',
    };

    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loadingAction = true;
      this.accountService.blockAccount(this.rib).subscribe({
        next: () => {
          this.loadingAction = false;
          if (this.account) this.account = { ...this.account, status: 'BLOQUE' };
          this.notify.success('Compte bloqué avec succès.');
        },
        error: (err) => {
          this.loadingAction = false;
          this.notify.error(err.error?.error ?? 'Erreur lors du blocage.');
        },
      });
    });
  }

  unblockAccount(): void {
    const data: ConfirmDialogData = {
      title: 'Débloquer le compte',
      message: `Êtes-vous sûr de vouloir débloquer le compte ${this.rib} ?`,
      confirmLabel: 'Débloquer',
      variant: 'primary',
    };

    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loadingAction = true;
      this.accountService.unblockAccount(this.rib).subscribe({
        next: () => {
          this.loadingAction = false;
          if (this.account) this.account = { ...this.account, status: 'ACTIF' };
          this.notify.success('Compte débloqué avec succès.');
        },
        error: (err) => {
          this.loadingAction = false;
          this.notify.error(err.error?.error ?? 'Erreur lors du déblocage.');
        },
      });
    });
  }

  openCloseDialog(): void {
    this.closeError = '';
    this.showCloseDialog = true;
  }

  cancelCloseDialog(): void {
    if (this.loadingClose) return;
    this.showCloseDialog = false;
    this.closeError = '';
  }

  confirmCloseAccount(): void {
    this.loadingClose = true;
    this.closeError   = '';
    this.accountService.closeAccount(this.rib).subscribe({
      next: () => {
        this.loadingClose    = false;
        this.showCloseDialog = false;
        if (this.account) this.account = { ...this.account, status: 'FERME' };
        this.notify.success('Compte fermé avec succès.');
      },
      error: (err) => {
        this.loadingClose = false;
        this.closeError   = err.error?.error ?? err.error?.message ?? 'Erreur lors de la fermeture.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/agent/clients', this.account?.clientCin]);
  }

  getStatusClass(status: string): string {
    return status === 'ACTIF' ? 'st-actif' : status === 'BLOQUE' ? 'st-bloque' : 'st-ferme';
  }

  getStatusLabel(status: string): string {
    return status === 'ACTIF' ? 'Actif' : status === 'BLOQUE' ? 'Bloqué' : 'Fermé';
  }
}