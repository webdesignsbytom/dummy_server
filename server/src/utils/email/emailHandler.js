import 'dotenv/config';
// Email
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
// Constants
import { BusinessName, BusinessUrl } from '../constants.js';

// Validate required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'AUTH_EMAIL', 'VERIFY_PASS', 'RESET_EMAIL', 'RESET_PASS', 'VERIFICATION_URL'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} is missing`);
  }
});

// Env
const EMAIL_HOST = process.env.EMAIL_HOST;

// Set up handlebars for HTML email templates
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve('./src/utils/email/'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./src/utils/email/'),
};


// Configure a single transporter with a function to set different auth credentials
const createTransporter = (user, pass) => {
  return nodemailer.createTransport({
    pool: true,
    host: EMAIL_HOST,
    port: 465, // mail port
    secure: true, // use TLS
    auth: {
      type: 'login',
      user,
      pass,
    },
  });
};

const transporter = createTransporter(
  process.env.AUTH_EMAIL,
  process.env.VERIFY_PASS
);
const resetTransporter = createTransporter(
  process.env.RESET_EMAIL,
  process.env.RESET_PASS
);

transporter.use('compile', hbs(handlebarOptions));
resetTransporter.use('compile', hbs(handlebarOptions));

const sendEmailHandler = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

export const sendVerificationEmail = async (id, userEmail, uniqueString) => {
  const clientUrl = process.env.VERIFICATION_URL;
  console.log('client url:', clientUrl);

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: userEmail,
    subject: `Welcome to ${BusinessName}`,
    template: `emailVerification`,
    context: {
      title: `Verification your email.`,
      businessName: BusinessName,
      expiryTime: `24 hours`,
      confirmationUrl: `${clientUrl}/users/verify-email/${id}/${uniqueString}`,
      businessUrl: BusinessUrl,
    },
  };

  console.log('url:', clientUrl + '/verify/' + id + '/' + uniqueString);
  await sendEmailHandler(transporter, mailOptions);
};

export const sendResetPasswordEmail = async (id, userEmail, uniqueString) => {
  const clientUrl = process.env.VERIFICATION_URL;
  console.log('client url:', clientUrl);

  const mailOptions = {
    from: process.env.RESET_EMAIL,
    to: userEmail,
    subject: `Password Reset`,
    template: `resetPassword`,
    context: {
      title: `Reset your password.`,
      businessName: BusinessName,
      businessUrl: BusinessUrl,
      resetUrl: `${clientUrl}/users/reset-password/${id}/${uniqueString}`,
    },
  };

  console.log('url:', clientUrl + '/reset-password/' + id + '/' + uniqueString);
  await sendEmailHandler(resetTransporter, mailOptions);
};
