import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Evita que usuarios ya autenticados accedan a /login o /register
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isReady$().pipe(
    map(loggedIn => {
      if (loggedIn) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
