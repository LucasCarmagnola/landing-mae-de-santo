import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Observamos el estado del usuario en Firebase
  return authService.usuario$.pipe(
    take(1), // Tomamos solo el primer valor que nos devuelve y nos desconectamos
    map(user => {
      if (user) {
        // Tiene llave, lo dejamos pasar
        return true; 
      } else {
        // No está logueado, lo mandamos al login
        router.navigate(['/login']);
        return false;
      }
    })
  );
};