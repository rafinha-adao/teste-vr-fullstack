import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { NotificacaoComponent } from './app/notificacao/notificacao';

bootstrapApplication(NotificacaoComponent, appConfig)
  .catch(err => console.error(err));
