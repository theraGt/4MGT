import { connection } from '../publisher.js';
import { sendEmail } from '../../utils/email.js';
import { welcomeTemplate } from '../../utils/templates/welcome.template.js';
import config from '../../config.js';

const EXCHANGE = config.exchange;
const QUEUE = 'usuario.email.4m.creado';
const ROUTING_KEY = 'usuario.4m.creado';

export const startUsuarioConsumer = async () => {
    try {
        console.log('🐰 Conectando consumer RabbitMQ...');

        const channel = await connection.createChannel();

        console.log('✅ Consumer conectado a RabbitMQ');

        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(QUEUE, { durable: true });
        await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

        console.log('👂 Esperando mensajes...');

        channel.consume(
            QUEUE,
            async (msg) => {
                console.log('🔥 MENSAJE RECIBIDO');

                if (!msg) {
                    console.log('⚠️ Mensaje vacío');
                    return;
                }

                try {
                    const data = JSON.parse(msg.content.toString());

                    console.log('📨 Evento recibido:', data);
                    console.log('📧 Enviando correo a:', data.email);

                    const response = await sendEmail({
                        to: data.email,
                        subject: 'Bienvenido a 4M',
                        html: welcomeTemplate(data.nombre, data.token),
                    });

                    console.log('📬 Respuesta email:', response);
                    channel.ack(msg);
                    console.log('✅ Mensaje confirmado');
                } catch (error) {
                    console.error('❌ Error procesando mensaje:', error);
                    channel.nack(msg, false, false);
                }
            },
            { noAck: false }
        );
    } catch (error) {
        console.error('❌ Error iniciando consumer:', error);
    }
};