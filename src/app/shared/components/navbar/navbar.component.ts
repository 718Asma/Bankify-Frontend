import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, CurrentUser } from '../../../core/services/auth.service';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { Notification } from '../../../core/models/banking.models';

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

  notifications: Notification[] = [];
  notifPanelOpen = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notifService: NotificationApiService,
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();

    this.notifService.loadNotifications().subscribe({
      next: () => {},
      error: () => {},
    });

    this.notifService.notifications$.subscribe(list => {
      this.notifications = list;
    });
  }

  get notifCount(): number {
    return this.notifications.length;
  }

  get fullName(): string {
    if (!this.user) return '';
    return `${this.user.prenom} ${this.user.nom}`;
  }

  get initials(): string {
    if (!this.user) return '?';
    return `${this.user.prenom[0]}${this.user.nom[0]}`.toUpperCase();
  }

  toggleNotifPanel(event: MouseEvent): void {
    event.stopPropagation();
    this.notifPanelOpen = !this.notifPanelOpen;
  }

  closeNotifPanel(): void {
    this.notifPanelOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.notifPanelOpen = false;
  }

  goToProfile(): void {
    this.router.navigate(['/app/profile']);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}