import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    console.log('🛡️ Interceptor inyectando token:', token.substring(0, 10) + '...');
    const clonada = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonada);
  }

  console.log('⚠️ Interceptor: No hay token disponible para', req.url);

  return next(req);
};

// ✅ RF/RNF cubiertos: [RNF-C1]
// ⚠️ CONFLICTO DETECTADO: Solo funciona con HttpClient de Angular,
//    no con fetch() nativo. TareaService fue migrado a HttpClient.
