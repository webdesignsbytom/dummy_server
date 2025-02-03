import 'dotenv/config';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { BusinessName } from '../constants.js';

// Validate required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'AUTH_EMAIL', 'AUTH_PASS'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is missing`);
  }
});

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10) || 465;
const AUTH_EMAIL = process.env.AUTH_EMAIL;
const AUTH_PASS = process.env.AUTH_PASS;

// Set up handlebars for HTML email templates
const handlebarOptions = {
  viewEngine: {
    extname: '.hbs',
    partialsDir: path.resolve('./src/utils/email/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./src/utils/email/'),
};

// Create transporter using cPanel SMTP settings
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // SSL for 465, TLS for 587
  auth: {
    user: AUTH_EMAIL,
    pass: AUTH_PASS,
  },
});

// Apply handlebars templating engine
transporter.use('compile', hbs(handlebarOptions));

/**
 * Sends an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} template - Handlebars template name (without .hbs)
 * @param {object} context - Data for the template
 * @returns {Promise<boolean>} - Returns true if sent, false otherwise
 */
export const sendEmail = async (to, subject, template, context = {}) => {
  const mailOptions = {
    from: `"${BusinessName}" <${AUTH_EMAIL}>`,
    to,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

/**
 * Sends a test email to verify SMTP configuration
 * @param {string} testEmail - The recipient email for testing
 */
export const sendTestEmail = async (testEmail) => {
  const mailOptions = {
    from: `"${BusinessName}" <${AUTH_EMAIL}>`,
    to: testEmail,
    subject: 'Test Email from NodeMailer',
    text: 'Hello! This is a test email sent via cPanel SMTP and NodeMailer.',
    html: '<h1>Hello!</h1><p>This is a test email sent via <b>cPanel SMTP</b> and <b>NodeMailer</b>.</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Test email sent: ${info.messageId}`);
  } catch (err) {
    console.error('❌ Error sending test email:', err);
  }
};

// If you want to run a test email directly from this script, uncomment the line below:
// sendTestEmail('yourtestemail@example.com');
