import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

const CLIENT_LINKS: NavItem[] = [
  { label: 'Dashboard',        icon: 'grid_view',              route: '/app/dashboard/client' },
  { label: 'Mes comptes',      icon: 'account_balance',        route: '/app/accounts' },
  { label: 'Virements',        icon: 'swap_horiz',             route: '/app/transfer' },
  { label: 'Dépôt',            icon: 'add_circle_outline',     route: '/app/deposit' },
  { label: 'Retrait',          icon: 'remove_circle_outline',  route: '/app/withdraw' },
  { label: 'Relevé de compte', icon: 'receipt_long',           route: '/app/statement' },
  { label: 'Mon profil',       icon: 'person_outline',         route: '/app/profile' },
];

const AGENT_LINKS: NavItem[] = [
  { label: 'Dashboard',         icon: 'grid_view',          route: '/app/dashboard/agent' },
  { label: 'Clients',           icon: 'people_outline',     route: '/app/agent/clients' },
  { label: 'Nouveau client',    icon: 'person_add_alt',     route: '/app/agent/clients/new' },
  { label: 'Ouvrir un compte',  icon: 'account_balance',    route: '/app/agent/accounts/new' },
  { label: 'Journal d\'audit',  icon: 'history',            route: '/app/agent/audit' },
  { label: 'Mon profil',        icon: 'person_outline',     route: '/app/profile' },
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
    this.role  = this.auth.getRole();
    this.links = this.role === 'AGENT' ? AGENT_LINKS : CLIENT_LINKS;
  }
}