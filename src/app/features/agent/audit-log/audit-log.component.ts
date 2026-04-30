import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuditService } from '../../../core/services/audit.service';
import { NotificationService } from '../../../core/services/notification.service';
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
  allEntries: AuditEntry[]      = [];
  pagedEntries: AuditEntry[]    = [];
  loading = true;

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
    { value: '',               label: 'Tous' },
    { value: 'DEPOT',          label: 'Dépôt' },
    { value: 'RETRAIT',        label: 'Retrait' },
    { value: 'VIREMENT',       label: 'Virement' },
  ];

  constructor(
    private auditService: AuditService,
    private notify: NotificationService,
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
        this.allEntries  = data;
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

  // ── Pagination ────────────────────────────────────────────────────────────
  paginate(): void {
    this.totalPages  = Math.ceil(this.allEntries.length / this.pageSize);
    const start      = this.currentPage * this.pageSize;
    this.pagedEntries = this.allEntries.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.paginate();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.paginate();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.paginate();
  }

  // ── Filters ───────────────────────────────────────────────────────────────
  applyFilters(): void {
    this.load();
  }

  resetFilters(): void {
    this.filterType      = '';
    this.filterDateDebut = '';
    this.filterDateFin   = '';
    this.load();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getStatusClass(statut: string): string {
    return statut === 'APPROUVE' ? 'status-success'
         : statut === 'ANNULE'   ? 'status-failed'
         : 'status-pending';
  }

  getStatusLabel(statut: string): string {
    return statut === 'APPROUVE' ? 'Succès'
         : statut === 'ANNULE'   ? 'Échoué'
         : 'En attente';
  }

  getTypeIcon(type: string): string {
    return type === 'VIREMENT' ? 'swap_horiz'
         : type === 'DEPOT'    ? 'add_circle_outline'
         : type === 'RETRAIT'  ? 'remove_circle_outline'
         : 'receipt_long';
  }

  getTypeClass(type: string): string {
    return type === 'DEPOT'  ? 'type-depot'
         : type === 'RETRAIT' ? 'type-retrait'
         : 'type-virement';
  }

  get totalElements(): number {
    return this.allEntries.length;
  }
}