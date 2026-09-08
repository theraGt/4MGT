import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config.js';

import authRoutes from './routes/auth/auth.routes.js';

const app = express();

// ======================
// MIDDLEWARES
// ======================
app.use(
    helmet({
        crossOriginResourcePolicy: false,
        crossOriginOpenerPolicy: false,
    })
);

app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// ======================
// CONFIG
// ======================
app.set('port', config.port);

// ======================
// HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '4M API funcionando',
        timestamp: new Date(),
    });
});

// ======================
// ROUTES
// ======================
app.use('/api/auth', authRoutes);

// ======================
// 404
// ======================
app.use((req, res) => {
    res.status(404).json({
        message: 'Ruta no encontrada',
    });
});

export default app;