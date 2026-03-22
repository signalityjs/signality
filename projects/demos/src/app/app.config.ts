import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { Layout } from './layout';
import { DEMO_ROUTES } from './demo-routes';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [...DEMO_ROUTES, { path: '', redirectTo: DEMO_ROUTES[0].path, pathMatch: 'full' }],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};
