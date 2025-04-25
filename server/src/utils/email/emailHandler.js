import 'dotenv/config';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
// Constants
import { BusinessName } from '../constants.js';
// File system
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const handlebarOptionsUserEmails = {
  viewEngine: {
    extname: '.hbs',
    partialsDir: path.join(__dirname, 'users'),  // Corrected path
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, 'users'),  // Corrected path
};

const handlebarOptionsBookingEmails = {
  viewEngine: {
    extname: '.hbs',
    partialsDir: path.join(__dirname, 'booking'),  // Corrected path
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, 'booking'),  // Corrected path
};

// Transporters
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


// Users
userAdminTransporter.use('compile', hbs(handlebarOptionsUserEmails));
userVerificationTransporter.use('compile', hbs(handlebarOptionsUserEmails));
userPasswordResetTransporter.use('compile', hbs(handlebarOptionsUserEmails));
// Booking
bookingTransporter.use('compile', hbs(handlebarOptionsBookingEmails));


// Email templates
// User admin
export const sendUserEmail = async (
  recipient,
  subject,
  template,
  context = {}
) => {
  console.log('EMAIL!!!', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${USER_ADMIN_EMAIL}>`,
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
  console.log('EMAIL VERIFY', recipient, subject, template, context);
  const mailOptions = {
    from: `"${BusinessName}" <${USER_VERIFY_EMAIL}>`,
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
    from: `"${BusinessName}" <${USER_RESET_EMAIL}>`,
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
    from: `"${BusinessName}"`,
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
