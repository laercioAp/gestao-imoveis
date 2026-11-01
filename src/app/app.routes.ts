
import { Routes } from '@angular/router';
import { AppLayout } from './layout/app-layout/app-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { NovoRecibo } from './pages/novo-recibo/novo-recibo';
import { Imoveis } from './pages/imoveis/imoveis';
import { Inquilinos } from './pages/inquilinos/inquilinos';
import { Contratos } from './pages/contratos/contratos';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: 'inicio', component: Dashboard },
      { path: 'imoveis', component: Imoveis },
      { path: 'inquilinos', component: Inquilinos },
      { path: 'recibos/novo', component: NovoRecibo },
      { path: 'contratos', component: Contratos },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];