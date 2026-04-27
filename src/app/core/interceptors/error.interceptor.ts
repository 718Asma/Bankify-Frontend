import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router  = inject(Router);
  const auth    = inject(AuthService);
  const notify  = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          auth.logout();
          router.navigate(['/login']);
          break;

        case 403:
          notify.error('Accès refusé. Vous n\'avez pas les droits nécessaires.');
          router.navigate(['/login']);
          break;

        default:
          if (error.status >= 500) {
            notify.error('Une erreur serveur est survenue. Veuillez réessayer.');
          }
          break;
      }

      return throwError(() => error);
    })
  );
};