import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { RegisterPageComponent } from './pages/register/register-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    title: 'Grupo Cordillera | Inicio',
  },
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard],
    title: 'Grupo Cordillera | Login',
  },
  {
    path: 'registro',
    component: RegisterPageComponent,
    canActivate: [guestGuard],
    title: 'Grupo Cordillera | Registro',
  },
  {
    path: 'dashboard',
    component: DashboardPageComponent,
    canActivate: [authGuard],
    title: 'Grupo Cordillera | Dashboard',
  },
  {
    path: '**',
    redirectTo: '',
  },
];