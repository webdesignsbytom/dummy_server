// Emitters
import { myEmitterErrors } from '../event/errorEvents.js';
// Response messages
import { sendDataResponse, sendMessageResponse } from '../utils/responses.js';
import {
  ServerErrorEvent,
} from '../event/utils/errorUtils.js';
import { sendTestEmail } from '../utils/email/emailHandler.js';

export const testError2025Handler = async (req, res, next) => { 
  try {
    const error = new Error('Test Error P2025');
    error.code = 'P2025'; 
    next(error); 
    //
  } catch (err) {
    // Error handling
    const serverError = new ServerErrorEvent(req.user, `Test server error: ${err.message}`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
  }
};

export const quickTestHandler = async (req, res) => { 
  try {
    return sendDataResponse(res, 200, { message: "Congratulations on finding my secret underground lair..." });
    //
  } catch (err) {
    // Error handling
    const serverError = new ServerErrorEvent(req.user, `Test server error: ${err.message}`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
  }
};

export const emailTestHandler = async (req, res) => { 
  try {
    // Send test email
    const testEmail = process.env.TEST_EMAIL; // Change to your real test email
    await sendTestEmail(testEmail);

    return sendDataResponse(res, 200, { message: "Congratulations on finding my secret underground lair... Test email sent!" });
  } catch (err) {
    // Error handling
    const serverError = new ServerErrorEvent(req.user, `Test server error: ${err.message}`);
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
  }
};