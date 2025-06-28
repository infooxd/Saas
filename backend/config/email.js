import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
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
  welcome: (user) => ({
    subject: `Welcome to ${process.env.APP_NAME}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Welcome to ${process.env.APP_NAME}!</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; color: white; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0;">Hi ${user.full_name}! 👋</h2>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">You're now part of our amazing community!</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0;">What's next?</h3>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li>🎨 Browse our template gallery</li>
            <li>🚀 Create your first project</li>
            <li>📊 Track your analytics</li>
            <li>💎 Upgrade to Pro for premium features</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Need help? Reply to this email or visit our <a href="${process.env.FRONTEND_URL}/support" style="color: #7c3aed;">support center</a></p>
          <p style="margin-top: 15px;">
            Best regards,<br>
            The ${process.env.APP_NAME} Team
          </p>
        </div>
      </div>
    `
  }),

  resetPassword: (user, resetUrl) => ({
    subject: `Reset Your ${process.env.APP_NAME} Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Password Reset</h1>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #92400e; margin-top: 0;">🔐 Password Reset Request</h3>
          <p style="color: #92400e; margin: 0;">We received a request to reset your password for ${user.email}</p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">Hi ${user.full_name},</p>
        <p style="color: #4b5563; line-height: 1.6;">Click the button below to reset your password. This link will expire in 1 hour.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>
            Best regards,<br>
            The ${process.env.APP_NAME} Team
          </p>
        </div>
      </div>
    `
  }),

  paymentSuccess: (user, plan, amount) => ({
    subject: `Payment Successful - Welcome to ${plan}! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Payment Successful!</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 15px; color: white; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0;">Welcome to ${plan}! 🚀</h2>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your payment of $${amount} has been processed successfully</p>
        </div>
        
        <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #15803d; margin-top: 0;">🎯 Your new benefits:</h3>
          <ul style="color: #15803d; line-height: 1.6;">
            <li>✨ Access to premium templates</li>
            <li>🚀 Unlimited projects</li>
            <li>📊 Advanced analytics</li>
            <li>🎨 Custom branding</li>
            <li>💬 Priority support</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Explore Premium Features
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Questions? Contact us at <a href="mailto:${process.env.EMAIL_FROM}" style="color: #7c3aed;">${process.env.EMAIL_FROM}</a></p>
          <p style="margin-top: 15px;">
            Thank you for choosing ${process.env.APP_NAME}!<br>
            The ${process.env.APP_NAME} Team
          </p>
        </div>
      </div>
    `
  }),

  affiliateCommission: (user, commission, referralName) => ({
    subject: `New Commission Earned: $${commission}! 💰`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Commission Earned!</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 15px; color: white; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0;">💰 $${commission} Commission</h2>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Great job! You've earned a new commission</p>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #92400e; margin-top: 0;">📊 Commission Details:</h3>
          <ul style="color: #92400e; line-height: 1.6;">
            <li><strong>Referral:</strong> ${referralName}</li>
            <li><strong>Commission:</strong> $${commission}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 25px;">
          <a href="${process.env.FRONTEND_URL}/affiliate" style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            View Affiliate Dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Keep sharing and earning more commissions!</p>
          <p style="margin-top: 15px;">
            Best regards,<br>
            The ${process.env.APP_NAME} Team
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
    
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      replyTo: process.env.EMAIL_REPLY_TO,
      subject: emailContent.subject,
      html: emailContent.html,
      headers: {
        'X-Mailer': `${process.env.APP_NAME} v1.0`,
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

// Send bulk emails
export const sendBulkEmail = async (recipients, template, data = {}) => {
  try {
    const results = await Promise.allSettled(
      recipients.map(recipient => sendEmail(recipient, template, data))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;
    
    return {
      success: true,
      total: results.length,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('❌ Bulk email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default { sendEmail, sendBulkEmail, emailTemplates };