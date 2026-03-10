const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationEmail = async (user, token) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/auth/verify/${token}`;

  await transporter.sendMail({
    from: `"EduLearn" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: '✅ Verifica tu cuenta en EduLearn',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #f4f6f8; padding: 2rem; border-radius: 12px;">
        <div style="text-align:center; margin-bottom: 1.5rem;">
          <h1 style="color: #e66000; margin: 0;">🎓 EduLearn</h1>
        </div>
        <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <h2 style="color: #2b3d4f; margin-top: 0;">¡Hola, ${user.name}!</h2>
          <p style="color: #555; line-height: 1.7;">
            Gracias por registrarte en EduLearn. Para activar tu cuenta y poder matricularte en cursos, 
            necesitas verificar tu dirección de email.
          </p>
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${verifyUrl}" 
               style="background: #e66000; color: white; padding: 0.9rem 2rem; border-radius: 8px; 
                      text-decoration: none; font-weight: 600; font-size: 1rem; display: inline-block;">
              Verificar mi cuenta
            </a>
          </div>
          <p style="color: #888; font-size: 0.85rem;">
            Este enlace expirará en <strong>24 horas</strong>. Si no creaste esta cuenta, puedes ignorar este email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 1.5rem 0;">
          <p style="color: #aaa; font-size: 0.8rem; margin: 0;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${verifyUrl}" style="color: #e66000; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
      </div>
    `
  });
};

exports.sendResendVerificationEmail = async (user, token) => {
  return exports.sendVerificationEmail(user, token);
};