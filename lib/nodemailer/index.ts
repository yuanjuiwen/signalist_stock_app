import sanitizeHtml from "sanitize-html";
import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE } from "./templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
          .replace(/{{name}}|{{intro}}/g, (placeholder) => placeholder === '{{name}}'
              ? name.replace(/[&<>"']/g, (character) => ({
                  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
                })[character]!)
              : sanitizeHtml(intro, {
                  allowedTags: ['p', 'strong', 'em', 'br'],
                  allowedAttributes: { p: ['class', 'style'] },
                  allowedClasses: { p: ['mobile-text'] },
                  allowedStyles: {
                      p: {
                          margin: [/^0 0 30px 0$/],
                          'font-size': [/^16px$/],
                          'line-height': [/^1\.6$/],
                          color: [/^#CCDADC$/i],
                      },
                  },
              }));

    const mailOptions = {
         from: `"Signalist" <wenkevin999@gmail.com>`,
         to: email,
         subject: `Welcome to Signalist - your stock market toolkit is ready!`,
         text: 'Thanks for joining Signalist',
         html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}