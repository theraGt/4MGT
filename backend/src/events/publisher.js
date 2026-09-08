import amqp from 'amqplib';
import config from '../config.js';

let connection = null;
let channel = null;

export const connectBroker = async () => {
    try {
        console.log('🐰 Intentando conectar RabbitMQ...');
        connection = await amqp.connect(config.rabbitmqUrl);
        channel = await connection.createChannel();
        console.log('✅ RabbitMQ conectado');
    } catch (error) {
        console.error('❌ Error RabbitMQ:', error);
    }
};

export const publishEvent = async (exchange, routingKey, data) => {
    try {
        if (!channel) {
            console.error('❌ Channel NULL');
            return;
        }

        await channel.assertExchange(exchange, 'topic', { durable: true });

        const sent = channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(data)),
            { persistent: true }
        );

        console.log(`📤 Evento publicado: ${exchange} -> ${routingKey}`);
        console.log('📦 Data:', data);
        console.log('✅ Resultado:', sent);
    } catch (error) {
        console.error('❌ Error publishEvent:', error);
    }
};

export { connection, channel };