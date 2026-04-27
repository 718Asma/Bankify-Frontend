import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ── Public routes (no auth) ──────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },

  // ── Protected routes (auth required) ────────────────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [

      // Profile (CLIENT + AGENT)
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'profile/change-password',
        loadComponent: () =>
          import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent),
      },

      // CLIENT dashboard
      {
        path: 'dashboard/client',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
      },

      // AGENT dashboard
      {
        path: 'dashboard/agent',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
      },
    ],
  },

  // ── Default redirect ─────────────────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];