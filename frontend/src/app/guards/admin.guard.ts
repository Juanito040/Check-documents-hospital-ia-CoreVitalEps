import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isReady$().pipe(
    map(loggedIn => {
      if (loggedIn && authService.isAdmin()) return true;
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
