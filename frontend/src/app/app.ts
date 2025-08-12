import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';

const materialComponents = [
  MatInputModule,
  MatButtonModule,
  MatListModule,
  MatFormFieldModule,
  MatChipsModule
];

interface Notificacao {
  mensagemId: string;
  conteudoMensagem: string;
  status: string;
}

const apiUrl = 'http://localhost:3000';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    ...materialComponents
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  conteudoMensagem = '';
  notificacoes: Notificacao[] = [];
  pollingSubscription?: Subscription;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.pollingSubscription = interval(5000).subscribe(() => {
      this.atualizarStatus();
    });
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  enviarNotificacao() {
    if (!this.conteudoMensagem.trim()) return;

    const mensagemId = uuidv4();

    const payload = {
      mensagemId,
      conteudoMensagem: this.conteudoMensagem.trim()
    };

    this.http.post(`${apiUrl}/api/notificar`, payload, { observe: 'response' }).subscribe({
      next: res => {
        if (res.status === 202) {
          this.notificacoes.push({
            mensagemId,
            conteudoMensagem: this.conteudoMensagem.trim(),
            status: 'AGUARDANDO PROCESSAMENTO'
          });
          this.conteudoMensagem = '';
        }
      },
      error: err => {
        console.error('Erro ao enviar notificação', err);
      }
    });
  }

  atualizarStatus() {
    this.notificacoes.forEach(notif => {
      this.http.get<{ status: string }>(`${apiUrl}/api/notificacao/status/${notif.mensagemId}`).subscribe({
        next: res => {
          if (res.status && res.status !== notif.status) {
            notif.status = res.status;
          }
        },
        error: err => {
          console.error(`Erro ao buscar status da mensagem ${notif.mensagemId}`, err);
        }
      });
    });
  }
}
