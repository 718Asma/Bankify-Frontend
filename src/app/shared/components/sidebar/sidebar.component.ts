import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

const CLIENT_LINKS: NavItem[] = [
  { label: 'Dashboard',               icon: 'grid_view',       route: '/dashboard/client' },
  { label: 'Mes comptes',             icon: 'account_balance', route: '/accounts' },
  { label: 'Virements',               icon: 'swap_horiz',      route: '/transfers' },
  { label: 'Historique transactions', icon: 'receipt_long',    route: '/transactions' },
  { label: 'Mon profil',              icon: 'person_outline',  route: '/profile' },
];

const AGENT_LINKS: NavItem[] = [
  { label: 'Dashboard',           icon: 'grid_view',        route: '/dashboard/agent' },
  { label: 'Gestion clients',     icon: 'people_outline',   route: '/clients' },
  { label: 'Gestion comptes',     icon: 'account_balance',  route: '/accounts' },
  { label: 'Demandes en attente', icon: 'pending_actions',  route: '/requests' },
  { label: 'Mon profil',          icon: 'person_outline',   route: '/profile' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  links: NavItem[] = [];
  role: string | null = null;
  year = new Date().getFullYear();

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.links = this.role === 'AGENT' ? AGENT_LINKS : CLIENT_LINKS;
  }
}