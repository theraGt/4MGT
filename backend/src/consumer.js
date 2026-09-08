import 'dotenv/config';
import { connectBroker } from "./events/publisher.js";
import { startConsumerPasswordResetEmail } from "./events/consumers/password-reset-email.consumer.js";
import { startLoginConsumer } from "./events/consumers/login.consumer.js";
import { startUsuarioConsumer } from "./events/consumers/usuario.consumer.js";

const start = async () => {
  await connectBroker();
  await startConsumerPasswordResetEmail();
  await startLoginConsumer();
  await startUsuarioConsumer();
  console.log("🚀 Consumer worker 4M iniciado");
};

start();