import 'dotenv/config';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
// Constants
import { BusinessName } from '../constants.js';

// Validate required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is missing`);
  }
});

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10) || 465;

// User emails
const USER_ADMIN_EMAIL = process.env.USER_ADMIN_EMAIL;
const USER_ADMIN_PASS = process.env.USER_ADMIN_PASS;
// Verify new user email
const USER_VERIFY_EMAIL = process.env.USER_VERIFY_EMAIL;
const USER_VERIFY_PASS = process.env.USER_VERIFY_PASS;
// Reset user password
const USER_RESET_EMAIL = process.env.USER_RESET_EMAIL;
const USER_RESET_PASS = process.env.USER_RESET_PASS;

// Booking
const BOOKING_ADMIN_EMAIL = process.env.BOOKING_ADMIN_EMAIL;
const BOOKING_ADMIN_PASS = process.env.BOOKING_ADMIN_PASS;

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

// Users
const userAdminTransporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // SSL for 465, TLS for 587
  auth: {
    user: USER_ADMIN_EMAIL,
    pass: USER_ADMIN_PASS,
  },
});
const userVerificationTransporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // SSL for 465, TLS for 587
  auth: {
    user: USER_VERIFY_EMAIL,
    pass: USER_VERIFY_PASS,
  },
});
const userPasswordResetTransporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // SSL for 465, TLS for 587
  auth: {
    user: USER_RESET_EMAIL,
    pass: USER_RESET_PASS,
  },
});

// Booking
const bookingTransporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // SSL for 465, TLS for 587
  auth: {
    user: BOOKING_ADMIN_EMAIL,
    pass: BOOKING_ADMIN_PASS,
  },
});

// Apply handlebars templating engine
transporter.use('compile', hbs(handlebarOptions));
// Users
userAdminTransporter.use('compile', hbs(handlebarOptions));
userVerificationTransporter.use('compile', hbs(handlebarOptions));
userPasswordResetTransporter.use('compile', hbs(handlebarOptions));
// Booking
bookingTransporter.use('compile', hbs(handlebarOptions));


// Email templates
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
    console.log(`✅ Email sent C: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

// User admin
export const sendUserEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `${BusinessName}`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await userAdminTransporter.sendMail(mailOptions);
    console.log(`✅ User admin Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};
// User verification
export const sendUserVerificationEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `${BusinessName}`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await userVerificationTransporter.sendMail(mailOptions);
    console.log(`✅ User admin Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};
// User password reset
export const sendUserPasswordResetEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `${BusinessName}`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await userPasswordResetTransporter.sendMail(mailOptions);
    console.log(`✅ User admin Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

export const sendBookingNotificationEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${BOOKING_ADMIN_EMAIL}>`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log(`✅ Booking Confirmation Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

export const sendBookingRequestRecievedEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${BOOKING_ADMIN_EMAIL}>`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log(`✅ Booking Confirmation Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

export const sendBookingConfirmedEmailToOwner = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${BOOKING_ADMIN_EMAIL}>`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log(`✅ Booking Confirmation Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

export const sendBookingConfirmedEmailToCustomer = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${BOOKING_ADMIN_EMAIL}>`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log(`✅ Booking Confirmation Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

export const sendBookingConfirmationFailed = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${BOOKING_ADMIN_EMAIL}>`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log(`✅ Booking Confirmation Email Sent: ${info.recipient}`);
    return true;
  } catch (err) {
    console.error('❌ Error sending email:', err);
    return false;
  }
};

export const sendBookingEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${BOOKING_ADMIN_EMAIL}>`,
    to: recipient,
    subject,
    template, // Matches the .hbs template
    context, // Data for template rendering
  };

  try {
    const info = await bookingTransporter.sendMail(mailOptions);
    console.log(`✅ Booking Confirmation Email Sent: ${info.recipient}`);
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
