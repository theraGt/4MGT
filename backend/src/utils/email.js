import nodemailer from 'nodemailer';
import config from '../config.js';

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: true,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
    },
});

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    const mailOptions = {
        from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
        to,
        subject,
        html,
        attachments,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado a ${to}`);
        return { ok: true, message: 'Correo enviado correctamente', info };
    } catch (error) {
        console.error('Error enviando correo:', error);
        return { ok: false, message: 'Error al enviar correo', error };
    }
};