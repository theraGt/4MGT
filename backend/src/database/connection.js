import { Pool } from 'pg';
import config from '../config.js';

const pool = new Pool(config.db);

pool.on('connect', () => {
    console.log('✅ Conexión a PostgreSQL establecida');
});

pool.on('error', (err) => {
    console.error('❌ Error en el pool de PostgreSQL:', err);
    process.exit(-1);
});

export async function getConnection() {
    return pool;
}

export default pool;