const express = require('express');
const cors = require('cors');
const rabbitmq = require('./rabbitmq');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

const filaEntrada = `fila.notificacao.entrada.rafaeladao`;
const filaStatus = `fila.notificacao.status.rafaeladao`;

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

const statusMap = new Map();

let channel;

async function start() {
    channel = await rabbitmq.connect(rabbitmqUrl);

    await rabbitmq.assertQueue(filaEntrada);
    await rabbitmq.assertQueue(filaStatus);

    await channel.consume(filaEntrada, async (msg) => {
        if (msg !== null) {
            const { mensagemId, conteudoMensagem } = JSON.parse(msg.content.toString());

            statusMap.set(mensagemId, 'PROCESSANDO');

            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            const random = Math.floor(Math.random() * 10) + 1;
            const status = random <= 2 ? 'FALHA_PROCESSAMENTO' : 'PROCESSADO_SUCESSO';

            statusMap.set(mensagemId, status);

            const resultado = { mensagemId, status };
            channel.sendToQueue(filaStatus, Buffer.from(JSON.stringify(resultado)), { persistent: true });

            channel.ack(msg);
        }
    });

    console.log('RabbitMQ conectado e consumidor configurado.');
}

app.post('/api/notificar', async (req, res) => {
    const { mensagemId, conteudoMensagem } = req.body;

    if (!mensagemId || typeof mensagemId !== 'string' || mensagemId.trim() === '') {
        return res.status(400).json({ error: 'mensagemId é obrigatório e deve ser string não vazia' });
    }

    if (!conteudoMensagem || typeof conteudoMensagem !== 'string' || conteudoMensagem.trim() === '') {
        return res.status(400).json({ error: 'conteudoMensagem é obrigatório e deve ser string não vazia' });
    }

    try {
        statusMap.set(mensagemId, 'AGUARDANDO_PROCESSAMENTO');
        await rabbitmq.publish(filaEntrada, { mensagemId, conteudoMensagem });
        res.status(202).json({ mensagemId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno' });
    }
});

app.get('/api/notificacao/status/:mensagemId', (req, res) => {
    const { mensagemId } = req.params;
    const status = statusMap.get(mensagemId);

    if (!status) {
        return res.status(404).json({ error: 'mensagemId não encontrado' });
    }

    res.json({ mensagemId, status });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    start();
});
