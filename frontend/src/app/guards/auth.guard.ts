import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isReady$().pipe(
    map(loggedIn => {
      if (loggedIn) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
