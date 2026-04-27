import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Usage in routes: canActivate: [roleGuard], data: { roles: ['CLIENT'] }
  const allowedRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.getRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};