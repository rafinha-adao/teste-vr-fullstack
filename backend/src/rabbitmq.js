const amqp = require('amqplib');

let channel;

async function connect(url) {
    const connection = await amqp.connect(url);
    channel = await connection.createChannel();
    return channel;
}

async function assertQueue(queue) {
    if (!channel) {
        throw new Error('Channel não inicializado');
    }

    await channel.assertQueue(queue, { durable: true });
}

async function publish(queue, message) {
    if (!channel) {
        throw new Error('Channel não inicializado');
    }

    const msgStr = JSON.stringify(message);
    return channel.sendToQueue(queue, Buffer.from(msgStr), { persistent: true });
}

function getChannel() {
    return channel;
}

module.exports = {
    connect,
    assertQueue,
    publish,
    getChannel
};
