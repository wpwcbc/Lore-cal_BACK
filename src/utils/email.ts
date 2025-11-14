// email.ts

import nodemailer, { type SendMailOptions } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

const sendEmail = async (options: SendMailOptions) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    } as SMTPTransport.Options);

    // 2) Define the email options
    const mailOptions = {
        from: 'Lore-cal <help@lorecal.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        // html:
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

export { sendEmail };
