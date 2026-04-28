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
      // TODO sprint2: reset-password/confirm (ResetPasswordConfirmComponent)
    ],
  },

  // ── Protected layout ─────────────────────────────────────────────────────
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    children: [

      // Profile
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

      // Client dashboard
      {
        path: 'dashboard/client',
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] },
        loadComponent: () =>
          import('./features/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
      },

      // Agent dashboard
      {
        path: 'dashboard/agent',
        canActivate: [roleGuard],
        data: { roles: ['AGENT'] },
        loadComponent: () =>
          import('./features/agent/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent),
      },

      // TODO sprint2: uncomment as components are created
      // { path: 'accounts',      ... AccountListComponent    }
      // { path: 'accounts/:rib', ... AccountDetailComponent  }
      // { path: 'transfer',      ... TransferComponent       }
      // { path: 'deposit',       ... DepositComponent        }
      // { path: 'withdraw',      ... WithdrawComponent       }
      // { path: 'statement',     ... StatementComponent      }
    ],
  },

  // ── Fallback ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'login' },
];