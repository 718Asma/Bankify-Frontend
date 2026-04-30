import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, CurrentUser } from '../../../core/services/auth.service';
import { NotificationApiService } from '../../../core/services/notification-api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  user: CurrentUser | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifService: NotificationApiService,
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
  }

  get fullName(): string {
    if (!this.user) return '';
    return `${this.user.prenom} ${this.user.nom}`;
  }

  get initials(): string {
    if (!this.user) return '?';
    return `${this.user.prenom[0]}${this.user.nom[0]}`.toUpperCase();
  }

  goToProfile(): void {
    this.router.navigate(['/app/profile']);
  }

  logout(): void {
    // Clear all cached state
    this.auth.logout();

    // Navigate to login — no full page reload
    this.router.navigate(['/login']);
  }
}