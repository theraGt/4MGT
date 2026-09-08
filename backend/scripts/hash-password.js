import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config();

const password = process.argv[2];

if (!password) {
    console.log('Uso: npm run hash -- "contraseña"');
    process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
    console.log(hash);
});