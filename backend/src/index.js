import app from './app.js';
import http from 'http';

import { connectBroker } from './events/publisher.js';

const PORT = app.get('port');

const startServer = async () => {
    try {
        await connectBroker();
        console.log('🐰 RabbitMQ conectado');
    } catch (error) {
        console.error('❌ RabbitMQ no disponible');
    }

    http.createServer(app).listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 4M API corriendo en http://localhost:${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    });
};

startServer();