import { Resend } from 'resend';

// Initialize with API key directly (temporary fix)
const resend = new Resend('re_759NvBX2_BbtXDFqN5eNpLFjvUW6WTYbw');

// Base configuration for all emails
const BASE_CONFIG = {
  from: 'APS Flooring <portal@apsflooring.info>',
};

// Email content templates
const EMAIL_TEMPLATES = {
  // Welcome email with login credentials
  customerPortalWelcome: (data: { name: string; email: string; password: string; loginUrl: string }) => ({
    subject: 'Welcome to APS Flooring Customer Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0;">Customer Portal</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
          <h2 style="color: #000000; margin-top: 0;">Welcome, ${data.name}!</h2>
          
          <p>Your APS Flooring customer portal account has been created. You can now access your project details, view progress updates, and communicate with our team in one convenient place.</p>
          
          <div style="background-color: #F9F9F9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
            <p style="margin: 0 0 5px 0;">Email: ${data.email}</p>
            <p style="margin: 0 0 15px 0;">Temporary Password: ${data.password}</p>
            <p style="font-size: 12px; color: #777777; margin: 0;">For security reasons, please change your password after your first login.</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">Login to Your Portal</a>
          </p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:support@apsflooring.info" style="color: #D4AF37;">support@apsflooring.info</a> or call us at (555) 123-4567.</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
          <p>&copy; ${new Date().getFullYear()} APS Flooring LLC. All rights reserved.</p>
          <p>123 Main Street, New Orleans, LA 12345</p>
        </div>
      </div>
    `,
  }),
  
  // Password reset email
  passwordReset: (data: { name: string; resetLink: string; expirationHours: number }) => ({
    subject: 'Reset Your APS Flooring Portal Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0;">Password Reset</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
          <h2 style="color: #000000; margin-top: 0;">Hello, ${data.name}</h2>
          
          <p>We received a request to reset your password for the APS Flooring Customer Portal. Click the button below to create a new password:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.resetLink}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </p>
          
          <p><strong>Note:</strong> This link will expire in ${data.expirationHours} hours.</p>
          
          <p>If you didn't request a password reset, please ignore this email or contact us at <a href="mailto:support@apsflooring.info" style="color: #D4AF37;">support@apsflooring.info</a> if you have any concerns.</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
          <p>&copy; ${new Date().getFullYear()} APS Flooring LLC. All rights reserved.</p>
          <p>123 Main Street, New Orleans, LA 12345</p>
        </div>
      </div>
    `,
  }),
  
  // Project update notification
  projectUpdate: (data: { name: string; projectTitle: string; updateMessage: string; loginUrl: string }) => ({
    subject: `Update on Your Project: ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0;">Project Update</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
          <h2 style="color: #000000; margin-top: 0;">Hello, ${data.name}</h2>
          
          <p>There's an update on your project "${data.projectTitle}":</p>
          
          <div style="background-color: #F9F9F9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;">${data.updateMessage}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">View Project Details</a>
          </p>
          
          <p>If you have any questions, please don't hesitate to contact your project manager or reach out to us at <a href="mailto:projects@apsflooring.info" style="color: #D4AF37;">projects@apsflooring.info</a>.</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
          <p>&copy; ${new Date().getFullYear()} APS Flooring LLC. All rights reserved.</p>
          <p>123 Main Street, New Orleans, LA 12345</p>
        </div>
      </div>
    `,
  }),
  
  // Document notification
  newDocument: (data: { name: string; projectTitle: string; documentName: string; documentType: string; loginUrl: string }) => ({
    subject: `New Document Available: ${data.projectTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <div style="background-color: #000000; padding: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #D4AF37; margin: 0;">APS Flooring</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0;">New Document Available</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #E5E5E5; border-radius: 5px;">
          <h2 style="color: #000000; margin-top: 0;">Hello, ${data.name}</h2>
          
          <p>A new document has been added to your project "${data.projectTitle}":</p>
          
          <div style="background-color: #F9F9F9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 5px 0;"><strong>Document:</strong> ${data.documentName}</p>
            <p style="margin: 0;"><strong>Type:</strong> ${data.documentType}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${data.loginUrl}" style="background-color: #D4AF37; color: #000000; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: bold; display: inline-block;">View Document</a>
          </p>
          
          <p>Log in to your customer portal to view and download this document. If you have any questions, please contact us at <a href="mailto:documents@apsflooring.info" style="color: #D4AF37;">documents@apsflooring.info</a>.</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; border-top: 1px solid #E5E5E5; text-align: center; font-size: 12px; color: #777777;">
          <p>&copy; ${new Date().getFullYear()} APS Flooring LLC. All rights reserved.</p>
          <p>123 Main Street, New Orleans, LA 12345</p>
        </div>
      </div>
    `,
  }),
};

// Email sending functions
export const emailService = {
  /**
   * Send an email with customer portal login credentials
   */
  sendCustomerPortalWelcome: async (options: {
    to: string;
    name: string;
    email: string;
    password: string;
    loginUrl?: string;
  }) => {
    const loginUrl = options.loginUrl || `${process.env.APP_URL || 'https://apsflooring.info'}/customer/login`;
    const template = EMAIL_TEMPLATES.customerPortalWelcome({
      name: options.name,
      email: options.email,
      password: options.password,
      loginUrl,
    });

    try {
      const result = await resend.emails.send({
        ...BASE_CONFIG,
        to: options.to,
        subject: template.subject,
        html: template.html,
      });
      console.log('Sent welcome email to', options.to, 'with result:', result);
      return { success: true, messageId: result.data?.id || 'unknown' };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }
  },

  /**
   * Send a password reset email
   */
  sendPasswordReset: async (options: {
    to: string;
    name: string;
    resetLink?: string;
    resetToken: string;
    expirationHours?: number;
  }) => {
    const expirationHours = options.expirationHours || 24;
    const baseUrl = process.env.APP_URL || 'https://apsflooring.info';
    const resetLink = options.resetLink || `${baseUrl}/customer/reset-password?token=${options.resetToken}`;
    
    const template = EMAIL_TEMPLATES.passwordReset({
      name: options.name,
      resetLink,
      expirationHours,
    });

    try {
      const result = await resend.emails.send({
        ...BASE_CONFIG,
        to: options.to,
        subject: template.subject,
        html: template.html,
      });
      console.log('Sent password reset email to', options.to, 'with result:', result);
      return { success: true, messageId: result.data?.id || 'unknown' };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { success: false, error };
    }
  },

  /**
   * Send a project update notification
   */
  sendProjectUpdate: async (options: {
    to: string;
    name: string;
    projectTitle: string;
    updateMessage: string;
    loginUrl?: string;
  }) => {
    const baseUrl = process.env.APP_URL || 'https://apsflooring.info';
    const loginUrl = options.loginUrl || `${baseUrl}/customer/login`;
    
    const template = EMAIL_TEMPLATES.projectUpdate({
      name: options.name,
      projectTitle: options.projectTitle,
      updateMessage: options.updateMessage,
      loginUrl,
    });

    try {
      const result = await resend.emails.send({
        ...BASE_CONFIG,
        from: 'APS Flooring Projects <projects@apsflooring.info>',
        to: options.to,
        subject: template.subject,
        html: template.html,
      });
      console.log('Sent project update email to', options.to, 'with result:', result);
      return { success: true, messageId: result.data?.id || 'unknown' };
    } catch (error) {
      console.error('Failed to send project update email:', error);
      return { success: false, error };
    }
  },

  /**
   * Send a notification about a new document
   */
  sendNewDocumentNotification: async (options: {
    to: string;
    name: string;
    projectTitle: string;
    documentName: string;
    documentType: string;
    loginUrl?: string;
  }) => {
    const baseUrl = process.env.APP_URL || 'https://apsflooring.info';
    const loginUrl = options.loginUrl || `${baseUrl}/customer/login`;
    
    const template = EMAIL_TEMPLATES.newDocument({
      name: options.name,
      projectTitle: options.projectTitle,
      documentName: options.documentName,
      documentType: options.documentType,
      loginUrl,
    });

    try {
      const result = await resend.emails.send({
        ...BASE_CONFIG,
        from: 'APS Flooring Documents <documents@apsflooring.info>',
        to: options.to,
        subject: template.subject,
        html: template.html,
      });
      console.log('Sent new document notification to', options.to, 'with result:', result);
      return { success: true, messageId: result.data?.id || 'unknown' };
    } catch (error) {
      console.error('Failed to send document notification:', error);
      return { success: false, error };
    }
  },

  /**
   * Send customer portal credentials during project creation
   */
  sendCustomerPortalCredentials: async (options: {
    to: string;
    name: string;
    username: string;
    password: string;
    loginUrl?: string;
  }) => {
    const baseUrl = process.env.APP_URL || 'https://apsflooring.info';
    const loginUrl = options.loginUrl || `${baseUrl}/customer/auth`;
    
    // Reuse the welcome template with slight modifications
    const template = EMAIL_TEMPLATES.customerPortalWelcome({
      name: options.name,
      email: options.username,  // Use username instead of email
      password: options.password,
      loginUrl,
    });

    try {
      const result = await resend.emails.send({
        ...BASE_CONFIG,
        to: options.to,
        subject: 'Your APS Flooring Customer Portal Credentials',
        html: template.html,
      });
      console.log('Sent portal credentials email to', options.to, 'with result:', result);
      return { success: true, messageId: result.data?.id || 'unknown' };
    } catch (error) {
      console.error('Failed to send portal credentials email:', error);
      return { success: false, error };
    }
  },

  /**
   * Send a custom email with any template
   */
  sendCustomEmail: async (options: {
    to: string;
    from?: string;
    subject: string;
    html: string;
  }) => {
    try {
      const result = await resend.emails.send({
        from: options.from || BASE_CONFIG.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log('Sent custom email to', options.to, 'with result:', result);
      return { success: true, messageId: result.data?.id || 'unknown' };
    } catch (error) {
      console.error('Failed to send custom email:', error);
      return { success: false, error };
    }
  },
};