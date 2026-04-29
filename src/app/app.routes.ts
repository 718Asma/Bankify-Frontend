import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // ── Public layout ────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./shared/layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
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
    ],
  },

  // ── Protected layout ─────────────────────────────────────────────────────
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [

      // ── Profile ────────────────────────────────────────────────────────
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

      // ── Client dashboard ───────────────────────────────────────────────
      {
        path: 'dashboard/client',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
      },

      // ── Client features ────────────────────────────────────────────────
      {
        path: 'accounts',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/account-list/account-list.component').then(m => m.AccountListComponent),
      },
      {
        path: 'accounts/:rib',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/account-detail/account-detail.component').then(m => m.AccountDetailComponent),
      },
      {
        path: 'transfer',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/transfer/transfer.component').then(m => m.TransferComponent),
      },
      {
        path: 'deposit',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/deposit/deposit.component').then(m => m.DepositComponent),
      },
      {
        path: 'withdraw',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/withdraw/withdraw.component').then(m => m.WithdrawComponent),
      },
      {
        path: 'statement',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/statement/statement.component').then(m => m.StatementComponent),
      },

      // ── Agent dashboard ────────────────────────────────────────────────
      {
        path: 'dashboard/agent',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
      },

      // ── Agent features ─────────────────────────────────────────────────
      {
        path: 'agent/clients',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/client-list/client-list.component').then(m => m.ClientListComponent),
      },
      {
        path: 'agent/clients/new',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/create-client/create-client.component').then(m => m.CreateClientComponent),
      },
      {
        path: 'agent/clients/:cin',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/client-detail/client-detail.component').then(m => m.ClientDetailComponent),
      },
      {
        path: 'agent/accounts/new',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/open-account/open-account.component').then(m => m.OpenAccountComponent),
      },
      {
        path: 'agent/accounts/:rib',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/account-management/account-management.component').then(m => m.AccountManagementComponent),
      },
      {
        path: 'agent/audit',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/audit-log/audit-log.component').then(m => m.AuditLogComponent),
      },
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'login' },
];