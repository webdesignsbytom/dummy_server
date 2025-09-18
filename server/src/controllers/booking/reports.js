import {
  findBookingSummaryReport,
  findAvailabilityHealthReport,
} from '../../domain/booking/reports.js';
import { myEmitterErrors } from '../../event/errorEvents.js';
import { myEmitterBookings } from '../../event/bookingEvents.js';
import {
  BadRequestEvent,
  NotFoundEvent,
  ServerErrorEvent,
} from '../../event/utils/errorUtils.js';
import {
  EVENT_MESSAGES,
  sendDataResponse,
  sendMessageResponse,
} from '../../utils/responses.js';

/* =========================
   ADMIN – Reports
   ========================= */

// [ADMIN] KPIs: totals, utilization, revenue
export const bookingSummaryReportHandler = async (req, res) => {
  const { resourceId = null, startDate = null, endDate = null } = req.query;

  // basic date validation (keeps your style — no schema lib here)
  if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Invalid startDate or endDate.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundReport = await findBookingSummaryReport({
      resourceId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    if (!foundReport) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Failed to calculate booking summary.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('reports:booking-summary', req.user);
    return sendDataResponse(res, 200, { report: foundReport });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Booking summary report failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Availability health: gaps, overbook risk, rule coverage
export const availabilityHealthReportHandler = async (req, res) => {
  const {
    resourceId = null,
    startDate = null,
    endDate = null,
  } = req.query;

  if (!resourceId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Missing resourceId.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      'Invalid startDate or endDate.'
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundReport = await findAvailabilityHealthReport({
      resourceId,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    if (!foundReport) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        'Failed to calculate availability health.'
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('reports:availability-health', req.user);
    return sendDataResponse(res, 200, { report: foundReport });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Availability health report failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
