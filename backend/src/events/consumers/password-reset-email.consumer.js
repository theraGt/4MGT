import { connection } from "../publisher.js";
import { sendEmail } from "../../utils/email.js";
import { passwordResetTokenTemplate } from "../../utils/templates/passwordReset.template.js";
import config from "../../config.js";

const EXCHANGE = config.exchange;
const QUEUE = "usuario.email.4m.password.reset";
const ROUTING_KEY = "usuario.4m.password.reset";

export const startConsumerPasswordResetEmail = async () => {
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  const { queue } = await channel.assertQueue(QUEUE, { durable: true });
  await channel.bindQueue(queue, EXCHANGE, ROUTING_KEY);
  await channel.prefetch(1);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    const buildCorreoPasswordReset = (email, nombre, token) => ({
      to: email,
      subject: "Recuperación de contraseña - 4M",
      html: passwordResetTokenTemplate(nombre, token),
    });

    try {
      const { email, nombre, token } = JSON.parse(msg.content.toString());
      const correoPasswordReset = buildCorreoPasswordReset(email, nombre, token);

      let intentos = 0;
      let enviado = false;

      while (intentos < 3) {
        const result = await sendEmail(correoPasswordReset);

        if (result.ok) {
          console.log(result.message);
          enviado = true;
          break;
        }

        intentos++;
      }

      if (!enviado) {
        console.error(`No se pudo enviar el correo a ${email} tras 3 intentos`);
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      channel.ack(msg);
    }
  });
};