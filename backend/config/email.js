import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const createTransporter = () => {
  // For development, use Ethereal Email (fake SMTP)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (user, verificationUrl) => ({
    subject: `Selamat Datang di ${process.env.APP_NAME || 'Oxdel'}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Selamat Datang di ${process.env.APP_NAME || 'Oxdel'}!</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; color: white; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0;">Halo ${user.full_name}! 👋</h2>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Terima kasih telah bergabung dengan kami!</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0;">Verifikasi Email Anda</h3>
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Untuk mengaktifkan akun Anda dan mulai menggunakan semua fitur Oxdel, silakan klik tombol di bawah ini:
          </p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verifikasi Email Saya
            </a>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 15px;">
            Link ini akan kedaluwarsa dalam 24 jam.
          </p>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h4 style="color: #15803d; margin-top: 0;">🎯 Yang bisa Anda lakukan:</h4>
          <ul style="color: #15803d; line-height: 1.6;">
            <li>🎨 Pilih dari 50+ template premium</li>
            <li>🚀 Buat website tanpa coding</li>
            <li>📊 Akses analytics mendalam</li>
            <li>💎 Trial gratis 14 hari fitur Pro</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Jika tombol tidak berfungsi, copy dan paste link ini ke browser:</p>
          <p style="word-break: break-all; color: #7c3aed;">${verificationUrl}</p>
          <p style="margin-top: 15px;">
            Salam hangat,<br>
            Tim ${process.env.APP_NAME || 'Oxdel'}
          </p>
        </div>
      </div>
    `
  }),

  resetPassword: (user, resetUrl) => ({
    subject: `Reset Password ${process.env.APP_NAME || 'Oxdel'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Reset Password</h1>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #92400e; margin-top: 0;">🔐 Permintaan Reset Password</h3>
          <p style="color: #92400e; margin: 0;">Kami menerima permintaan reset password untuk ${user.email}</p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">Halo ${user.full_name},</p>
        <p style="color: #4b5563; line-height: 1.6;">Klik tombol di bawah untuk reset password Anda. Link ini akan kedaluwarsa dalam 1 jam.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Jika Anda tidak meminta reset password, abaikan email ini atau hubungi support.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>
            Salam,<br>
            Tim ${process.env.APP_NAME || 'Oxdel'}
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    
    const emailContent = emailTemplates[template](data.user, data.verificationUrl || data.resetUrl);
    
    const mailOptions = {
      from: `${process.env.APP_NAME || 'Oxdel'} <${process.env.EMAIL_FROM || 'noreply@oxdel.com'}>`,
      to,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@oxdel.com',
      subject: emailContent.subject,
      html: emailContent.html,
      headers: {
        'X-Mailer': `${process.env.APP_NAME || 'Oxdel'} v1.0`,
        'X-Priority': '3'
      }
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      to,
      template,
      messageId: result.messageId
    });
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default { sendEmail, emailTemplates };