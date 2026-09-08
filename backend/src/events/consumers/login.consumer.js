import { connection } from '../publisher.js';
import { sendEmail } from '../../utils/email.js';
import { loginTokenTemplate } from '../../utils/templates/login-token.template.js';
import config from '../../config.js';

const EXCHANGE = config.exchange;
const QUEUE = 'usuario.email.4m.login.verificacion';
const ROUTING_KEY = 'usuario.4m.login.verificacion';

export const startLoginConsumer = async () => {
    try {
        const channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(QUEUE, { durable: true });
        await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);

        console.log('📩 Consumer login token iniciado');

        channel.consume(QUEUE, async (msg) => {
            if (!msg) return;

            try {
                const data = JSON.parse(msg.content.toString());

                console.log('📨 Evento login recibido:', data);

                await sendEmail({
                    to: data.email,
                    subject: 'Código de acceso - 4M',
                    html: loginTokenTemplate(data.nombre, data.token),
                });

                console.log('✅ Correo login enviado');
                channel.ack(msg);
            } catch (error) {
                console.error('❌ Error procesando login:', error);
                channel.nack(msg, false, false);
            }
        });
    } catch (error) {
        console.error('❌ Error iniciando consumer login:', error);
    }
};