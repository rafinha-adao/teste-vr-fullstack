const rabbitmq = require('../src/rabbitmq');

jest.mock('amqplib', () => ({
    connect: jest.fn().mockResolvedValue({
        createChannel: jest.fn().mockResolvedValue({
            sendToQueue: jest.fn(() => true),
            assertQueue: jest.fn(() => true),
        }),
    }),
}));

describe('RabbitMQ module', () => {
    beforeAll(async () => {
        await rabbitmq.connect('amqp://test');
    });

    it('deve publicar mensagem corretamente', async () => {
        const queue = 'teste.fila';
        const message = { mensagemId: '271dad80-f406-46fa-97aa-c8802d957336', conteudoMensagem: 'Mensagem teste' };
        const channel = rabbitmq.getChannel();
        const spy = jest.spyOn(channel, 'sendToQueue');

        await rabbitmq.publish(queue, message);

        expect(spy).toHaveBeenCalledWith(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    });
});
