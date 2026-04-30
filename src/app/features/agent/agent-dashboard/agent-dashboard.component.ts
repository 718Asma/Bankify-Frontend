import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { AgentStatsService } from '../../../core/services/agent-stats.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AgentStats } from '../../../core/models/agent.models';

declare const Chart: any;

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css',
})
export class AgentDashboardComponent implements OnInit, OnDestroy {

  stats: AgentStats | null = null;
  loading = true;

  private destroy$ = new Subject<void>();
  private barChart: any   = null;
  private donutChart: any = null;

  constructor(
    private statsService: AgentStatsService,
    private auth: AuthService,
  ) {}

  get userName(): string {
    const u = this.auth.getCurrentUser();
    return u ? u.prenom : '';
  }

  ngOnInit(): void {
    this.statsService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats   = data;
          this.loading = false;
          setTimeout(() => {
            this.renderBarChart();
            this.renderDonutChart();
          }, 50);
        },
        error: () => { this.loading = false; },
      });
  }

  // ── Bar chart : operations per day ───────────────────────────────────────
  private renderBarChart(): void {
    const canvas = document.getElementById('opsBarChart') as HTMLCanvasElement;
    if (!canvas || !this.stats || typeof Chart === 'undefined') return;
    if (this.barChart) this.barChart.destroy();

    const labels = this.stats.operationsParJour.map(o => o.date);
    const data   = this.stats.operationsParJour.map(o => o.count);

    this.barChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Opérations',
          data,
          backgroundColor: 'rgba(201,168,76,0.6)',
          borderColor: '#C9A84C',
          borderWidth: 1,
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.raw} opération(s)`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              font: { family: 'Roboto', size: 11 },
              color: '#9aa3b0',
              maxRotation: 45,
            },
            grid: { display: false },
          },
          y: {
            ticks: {
              font: { family: 'Roboto', size: 11 },
              color: '#9aa3b0',
              stepSize: 1,
            },
            grid: { color: 'rgba(0,0,0,0.05)' },
            beginAtZero: true,
          },
        },
      },
    });
  }

  // ── Donut chart : account type breakdown ─────────────────────────────────
  private renderDonutChart(): void {
    const canvas = document.getElementById('accountDonutChart') as HTMLCanvasElement;
    if (!canvas || !this.stats || typeof Chart === 'undefined') return;
    if (this.donutChart) this.donutChart.destroy();

    const total = this.stats.repartitionComptes.reduce((s, r) => s + r.count, 0);
    if (total === 0) return;

    const labels = this.stats.repartitionComptes.map(r => r.type);
    const data   = this.stats.repartitionComptes.map(r => r.count);

    this.donutChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#1a3a4a', '#C9A84C'],
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
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
              label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} compte(s)`,
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.barChart)   this.barChart.destroy();
    if (this.donutChart) this.donutChart.destroy();
  }
}