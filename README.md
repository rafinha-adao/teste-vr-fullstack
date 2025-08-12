# 🚀 Sistema de Notificações Assíncronas Simplificado

Projeto com **Angular 20** (frontend) + **Node.js/Express.js** (backend) + **RabbitMQ** para mensageria.  

---

## 📋 O que faz?

- Frontend envia notificações com mensagemId e texto  
- Backend publica na fila RabbitMQ e responde com status 202  
- Consumidor processa a mensagem (delay e chance de falha simulados)  
- Status armazenado em memória e consultado pelo frontend via polling  
- Frontend mostra lista atualizada com status das notificações  

---

## 🛠 Tecnologias

- Angular 20  
- Node.js + Express.js  
- RabbitMQ  
- Jest (teste unitário backend)  

---

## ⚡ Como rodar

1. Configure RabbitMQ (local ou Docker)
2. `npm install` e `npm start` no backend  
3. `npm install` e `ng serve` no frontend  
4. Acesse `http://localhost:4200`  

---

## ✅ Testes

- Teste unitário no backend para publicação no RabbitMQ usando Jest + mocks  

---

## 🚨 Observações

- Atualização de status via polling (não websockets)  
- Status armazenado em memória (sem banco de dados)  
