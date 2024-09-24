import bcrypt from 'bcrypt';
// Database
import { findUserByEmail } from '../domain/users.js';
// Responses
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';
// Events
import { myEmitterErrors } from '../event/errorEvents.js';
import { LoginServerErrorEvent } from '../event/utils/errorUtils.js';
// Token
import { createAccessToken } from '../utils/tokens.js';
// Oauth
import { OAuth2Client } from 'google-auth-library';

export const loginHelper = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendDataResponse(res, 400, {
      email: 'Missing email and/or password provided',
    });
  }

  const lowerCaseEmail = email.toLowerCase();

  try {
    const existingUser = await findUserByEmail(lowerCaseEmail);

    const areCredentialsValid = await validateCredentials(
      password,
      existingUser
    );

    if (!areCredentialsValid) {
      return sendDataResponse(res, 400, {
        email: 'Invalid email and/or password provided',
      });
    }

    delete existingUser.password;

    const token = createAccessToken(existingUser.id, existingUser.email);
    return sendDataResponse(res, 200, { token, existingUser });
  } catch (err) {
    //
    const serverError = new LoginServerErrorEvent(email, `Login Server error`);
    myEmitterErrors.emit('error-login', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export async function validateCredentials(password, user) {
  if (!user) {
    return false;
  }

  if (!password) {
    return false;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return false;
  }

  return true;
}

export const googleLoginHelper = async (req, res) => {
  console.log('googleLoginHelper');
  
  try {
    res.header('Access-Control-Allow-Origin', `${process.env.OAUTH_CLIENT_URL}`);
    res.header('Referrer-Policy', 'no-referrer-when-downgrade') // for http only

    // Redirect url to send the client
    const redirectUrl = 'http://127.0.0.1:4000/oauth'

    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl,
    )

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline', // offline for testing - 
      scope: 'https://www.googleapis.com/auth/userinfo.profile openid',
      prompt: 'concent' // keep the concent screen open
    })

    res.json({ url: authorizeUrl })

  } catch (err) {
    //
    const serverError = new LoginServerErrorEvent(email, `Login OAuth Server error`);
    myEmitterErrors.emit('error-login', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
