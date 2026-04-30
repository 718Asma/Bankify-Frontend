import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AuditService } from '../../../core/services/audit.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AuditEntry, AuditFilters } from '../../../core/models/agent.models';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.css',
})
export class AuditLogComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────────────────────
  allEntries: AuditEntry[]   = [];
  pagedEntries: AuditEntry[] = [];
  loading = true;

  // Per-row action loading state (keyed by entry id)
  actionLoading: Record<number, boolean> = {};

  // ── Filters ───────────────────────────────────────────────────────────────
  filterType      = '';
  filterDateDebut = '';
  filterDateFin   = '';

  // ── Pagination ────────────────────────────────────────────────────────────
  pageSize    = 10;
  currentPage = 0;
  totalPages  = 0;

  readonly PAGE_SIZES = [10, 25, 50];

  readonly OPERATION_TYPES = [
    { value: '',         label: 'Tous'      },
    { value: 'DEPOT',    label: 'Dépôt'     },
    { value: 'RETRAIT',  label: 'Retrait'   },
    { value: 'VIREMENT', label: 'Virement'  },
  ];

  constructor(
    private auditService: AuditService,
    private notify: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  load(): void {
  this.loading = true;

  const filters: AuditFilters = {};
  if (this.filterType)      filters.type      = this.filterType;
  if (this.filterDateDebut) filters.dateDebut = this.filterDateDebut;
  if (this.filterDateFin)   filters.dateFin   = this.filterDateFin;

  this.auditService.getAuditLog(filters).subscribe({
    next: (data) => {

      this.allEntries = data.sort((a, b) => {

        // 🔥 1. Priorité statut
        const priority = (statut: string) => {
          if (statut === 'EN_ATTENTE') return 0;
          if (statut === 'APPROUVE')   return 1;
          if (statut === 'ANNULE')     return 2;
          return 3;
        };

        const diffPriority = priority(a.statut) - priority(b.statut);
        if (diffPriority !== 0) return diffPriority;

        // 🔥 2. Sinon → tri par date (plus récent d'abord)
        return new Date(b.dateRealisation).getTime() -
               new Date(a.dateRealisation).getTime();
      });

      this.currentPage = 0;
      this.paginate();
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.notify.error('Erreur lors du chargement du journal.');
    },
  });
}

  // ── Actions ───────────────────────────────────────────────────────────────
  approuver(entry: AuditEntry): void {
    const data: ConfirmDialogData = {
      title: 'Approuver la transaction',
      message: `Confirmer l'approbation de la transaction #${entry.id} (${entry.montant} TND) ?`,
      confirmLabel: 'Approuver',
      variant: 'primary',
    };

    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.actionLoading[entry.id] = true;

      this.auditService.approuverTransaction(entry.id).subscribe({
        next: (updated) => {
          this.actionLoading[entry.id] = false;
          // Update in place — no full reload needed
          this.updateEntry(updated);
          this.notify.success(`Transaction #${entry.id} approuvée avec succès.`);
        },
        error: (err) => {
          this.actionLoading[entry.id] = false;
          this.notify.error(err.error?.message ?? 'Erreur lors de l\'approbation.');
        },
      });
    });
  }

  annuler(entry: AuditEntry): void {
    const data: ConfirmDialogData = {
      title: 'Annuler la transaction',
      message: `Êtes-vous sûr de vouloir annuler la transaction #${entry.id} (${entry.montant} TND) ? Cette action est irréversible.`,
      confirmLabel: 'Annuler la transaction',
      variant: 'warn',
    };

    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.actionLoading[entry.id] = true;

      this.auditService.annulerTransaction(entry.id).subscribe({
        next: (updated) => {
          this.actionLoading[entry.id] = false;
          this.updateEntry(updated);
          this.notify.success(`Transaction #${entry.id} annulée.`);
        },
        error: (err) => {
          this.actionLoading[entry.id] = false;
          this.notify.error(err.error?.message ?? 'Erreur lors de l\'annulation.');
        },
      });
    });
  }

  /** Update a single entry in both allEntries and pagedEntries */
  private updateEntry(updated: AuditEntry): void {
    const updateIn = (list: AuditEntry[]) => {
      const idx = list.findIndex(e => e.id === updated.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...updated };
    };
    updateIn(this.allEntries);
    updateIn(this.pagedEntries);
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  paginate(): void {
    this.totalPages   = Math.ceil(this.allEntries.length / this.pageSize);
    const start       = this.currentPage * this.pageSize;
    this.pagedEntries = this.allEntries.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 0) { this.currentPage--; this.paginate(); }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.paginate(); }
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.paginate();
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  applyFilters(): void { this.load(); }

  resetFilters(): void {
    this.filterType      = '';
    this.filterDateDebut = '';
    this.filterDateFin   = '';
    this.load();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStatusClass(statut: string): string {
    return statut === 'APPROUVE'   ? 'status-success'
         : statut === 'ANNULE'     ? 'status-failed'
         : 'status-pending';
  }

  getStatusLabel(statut: string): string {
    return statut === 'APPROUVE'   ? 'Approuvé'
         : statut === 'ANNULE'     ? 'Annulé'
         : 'En attente';
  }

  getTypeIcon(type: string): string {
    return type === 'VIREMENT' ? 'swap_horiz'
         : type === 'DEPOT'    ? 'add_circle_outline'
         : type === 'RETRAIT'  ? 'remove_circle_outline'
         : 'receipt_long';
  }

  getTypeClass(type: string): string {
    return type === 'DEPOT'   ? 'type-depot'
         : type === 'RETRAIT' ? 'type-retrait'
         : 'type-virement';
  }

  get totalElements(): number {
    return this.allEntries.length;
  }
}