import { Routes } from '@angular/router';
import { NotificacaoComponent } from './notificacao/notificacao';

export const routes: Routes = [
    { path: '', redirectTo: 'notificacao', pathMatch: 'full' },
    { path: 'notificacao', component: NotificacaoComponent }
];
