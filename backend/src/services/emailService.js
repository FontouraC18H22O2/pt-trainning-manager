const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// 📬 Função genérica para enviar emails
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `PT-Control <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Erro crítico ao enviar email:', error);
      throw new Error('Não foi possível enviar o email de notificação.');
    }

    console.log('✉️ Email enviado com sucesso:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Erro crítico ao enviar email:', error);
    throw new Error('Não foi possível enviar o email de notificação.');
  }
};

module.exports = {
  sendEmail,
};