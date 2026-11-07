
import { Routes } from '@angular/router';

import { AppLayout } from './layout/app-layout/app-layout';
import { Login } from './pages/login/login';

import { Dashboard } from './pages/dashboard/dashboard';
import { Imoveis } from './pages/imoveis/imoveis';
import { Inquilinos } from './pages/inquilinos/inquilinos';
import { Contratos } from './pages/contratos/contratos';
import { Pagamentos } from './pages/pagamentos/pagamentos';
import { NovoRecibo } from './pages/novo-recibo/novo-recibo';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // Rota pública
  {
    path: 'login',
    component: Login
  },

  // Rotas protegidas
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'inicio', component: Dashboard },
      { path: 'imoveis', component: Imoveis },
      { path: 'inquilinos', component: Inquilinos },
      { path: 'contratos', component: Contratos },
      { path: 'pagamentos', component: Pagamentos },
      { path: 'recibos/novo', component: NovoRecibo },

      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },

  // Qualquer rota desconhecida redireciona para o login
  {
    path: '**',
    redirectTo: 'login'
  }

];
