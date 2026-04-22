import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
// --- INICIO CÓDIGO AÑADIDO ---
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
// --- FIN CÓDIGO AÑADIDO ---

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // --- INICIO CÓDIGO AÑADIDO ---
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
    // --- FIN CÓDIGO AÑADIDO ---
  ]
};

// ✅ RF/RNF cubiertos: [RNF-C1]
