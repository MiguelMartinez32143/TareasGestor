import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

// ✅ RF/RNF cubiertos: [RF-A2, RF-C2]
// ⚠️ CONFLICTO DETECTADO: Ninguno. Redirige a '/' (inicio) ya que
//    la app no usa ruta /login dedicada — el login está en el encabezado.
