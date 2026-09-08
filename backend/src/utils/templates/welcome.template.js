export const welcomeTemplate = (nombre, token) => {
    return `
    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bienvenido a 4M</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #14100E;
        font-family: Arial, Helvetica, sans-serif;
        color: #FFFFFF;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #14100E; padding: 40px 0;">
            <tr>
                <td align="center">

                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="
                        background-color: #1F1713;
                        border-radius: 18px;
                        overflow: hidden;
                        border: 1px solid #3A211B;
                    ">

                        <!-- HEADER -->
                        <tr>
                            <td align="center" style="
                                background: linear-gradient(135deg, #2A0F0C, #6E1510);
                                padding: 45px 20px;
                            ">
                                <h1 style="margin: 0; font-size: 46px; font-weight: bold; color: #FFFFFF; letter-spacing: 6px;">
                                    4M
                                </h1>
                                <p style="margin-top: 10px; margin-bottom: 0; color: #E8A48F; font-size: 14px; font-weight: bold; letter-spacing: 2px;">
                                    Ordinary people · Extraordinary lives
                                </p>
                            </td>
                        </tr>

                        <!-- CONTENT -->
                        <tr>
                            <td style="padding: 45px 40px;">
                                <h2 style="margin-top: 0; font-size: 26px; color: #FFFFFF;">
                                    Bienvenido, ${nombre}
                                </h2>
                                <p style="font-size: 16px; line-height: 1.7; color: #D8C6BE;">
                                    Tu cuenta en <strong style="color: #F1C40F;">4M</strong> fue creada correctamente.
                                </p>
                                <p style="font-size: 16px; line-height: 1.7; color: #D8C6BE;">
                                    Para confirmar tu correo electrónico, utiliza el siguiente código de verificación:
                                </p>

                                <!-- TOKEN -->
                                <div style="text-align: center; margin: 40px 0;">
                                    <div style="
                                        display: inline-block;
                                        background-color: #0F0B09;
                                        border: 2px solid #CD171E;
                                        border-radius: 14px;
                                        padding: 18px 35px;
                                        font-size: 34px;
                                        font-weight: bold;
                                        letter-spacing: 10px;
                                        color: #F1C40F;
                                    ">
                                        ${token}
                                    </div>
                                </div>

                                <p style="font-size: 14px; color: #A08D84; line-height: 1.6;">
                                    🔒 Este código es temporal y expira en los próximos minutos por seguridad.
                                </p>

                                <!-- BUTTON -->
                                <div style="text-align: center; margin-top: 45px;">
                                    <a href="${process.env.APP_URL || 'http://localhost:8100'}/login" style="
                                        background: linear-gradient(135deg, #8E1210, #CD171E);
                                        color: #FFFFFF;
                                        text-decoration: none;
                                        padding: 16px 34px;
                                        border-radius: 12px;
                                        font-weight: bold;
                                        font-size: 15px;
                                        display: inline-block;
                                        border: 1px solid #F5821E;
                                    ">
                                        Ingresar a mi cuenta 4M
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <!-- FOOTER -->
                        <tr>
                            <td style="background-color: #0F0B09; padding: 30px; text-align: center;">
                                <p style="margin: 0; color: #8A7B73; font-size: 13px; line-height: 1.7;">
                                    © ${new Date().getFullYear()} 4M - Cuatro Mosqueteros.
                                    Todos los derechos reservados.
                                </p>
                                <p style="margin-top: 8px; color: #5F5550; font-size: 11px;">
                                    Este mensaje fue generado automáticamente. Por favor no responder a este correo.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};