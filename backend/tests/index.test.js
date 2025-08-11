const request = require('supertest');
const express = require('express');
const cors = require('cors');
const rabbitmq = require('../src/rabbitmq');

jest.mock('../src/rabbitmq');

const app = express();
app.use(cors());
app.use(express.json());

const filaEntrada = `fila.notificacao.entrada.rafaeladao`;

app.post('/api/notificar', async (req, res) => {
    const { mensagemId, conteudoMensagem } = req.body;

    if (!mensagemId || typeof mensagemId !== 'string' || mensagemId.trim() === '') {
        return res.status(400).json({ error: 'mensagemId é obrigatório' });
    }
    
    if (!conteudoMensagem || typeof conteudoMensagem !== 'string' || conteudoMensagem.trim() === '') {
        return res.status(400).json({ error: 'conteudoMensagem é obrigatório' });
    }

    try {
        await rabbitmq.publish(filaEntrada, { mensagemId, conteudoMensagem });
        res.status(202).json({ mensagemId });
    } catch {
        res.status(500).json({ error: 'Erro interno' });
    }
});

describe('POST /api/notificar', () => {
    it('responde 202 e publica mensagem', async () => {
        const spy = jest.spyOn(rabbitmq, 'publish').mockResolvedValue(true);

        const response = await request(app)
            .post('/api/notificar')
            .send({ mensagemId: '123', conteudoMensagem: 'teste' });

        expect(response.status).toBe(202);
        expect(response.body.mensagemId).toBe('123');
        expect(spy).toHaveBeenCalledWith(filaEntrada, { mensagemId: '123', conteudoMensagem: 'teste' });
    });

    it('responde 400 se mensagemId vazio', async () => {
        const response = await request(app)
            .post('/api/notificar')
            .send({ mensagemId: '', conteudoMensagem: 'teste' });

        expect(response.status).toBe(400);
    });

    it('responde 400 se conteudoMensagem vazio', async () => {
        const response = await request(app)
            .post('/api/notificar')
            .send({ mensagemId: '123', conteudoMensagem: '' });

        expect(response.status).toBe(400);
    });

    it('responde 500 se publish falhar', async () => {
        jest.spyOn(rabbitmq, 'publish').mockRejectedValue(new Error('fail'));

        const response = await request(app)
            .post('/api/notificar')
            .send({ mensagemId: '123', conteudoMensagem: 'teste' });

        expect(response.status).toBe(500);
    });
});
