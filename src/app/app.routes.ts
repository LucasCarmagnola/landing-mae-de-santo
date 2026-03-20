import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';


export const routes: Routes = [
    { 
    path: '', 
    loadComponent: () => import('./components/home/home').then(m => m.Home)
  },
  
  // Ruta del Login
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  { 
    path: 'admin', 
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin/admin').then(m => m.AdminComponent)
  },

  // (Opcional) Ruta comodín: Si tipean cualquier verdura en la URL, los manda al home
  { 
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full' 
  }
];
