import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ClientAgentService } from '../../../core/services/client-agent.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ClientDetail } from '../../../core/models/agent.models';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, LoadingSpinnerComponent],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  allClients: ClientDetail[] = [];
  filteredClients: ClientDetail[] = [];
  cinQuery = '';
  loading  = false;
  searched = false;
  result: ClientDetail | null = null;

  constructor(
    private clientService: ClientAgentService,
    private notify: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.allClients      = clients;
        this.filteredClients = clients;
        this.loading         = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('Impossible de charger les clients.');
      },
    });
  }

  search(): void {
    if (!this.cinQuery) return;

    this.loading  = true;
    this.searched = false;
    this.result   = null;

    this.clientService.getClientByCIN(Number(this.cinQuery)).subscribe({
      next: (client) => {
        this.result   = client;
        this.loading  = false;
        this.searched = true;
      },
      error: (err) => {
        this.result   = err.status === 404 ? null : null;
        this.loading  = false;
        this.searched = true;
        if (err.status !== 404) {
          this.notify.error('Erreur lors de la recherche.');
        }
      },
    });
  }

  initials(client: ClientDetail): string {
    return `${client.prenom[0]}${client.nom[0]}`.toUpperCase();
  }
}