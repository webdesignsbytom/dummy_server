import { myEmitterBookings } from '../../event/bookingEvents.js';
import { myEmitterErrors } from '../../event/errorEvents.js';
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
import {
  findAvailableDays,
  findAvailableSlots,
  findRulesByResourceId,
  createNewWeeklyRule,
  updateExistingWeeklyRule,
  deleteExistingWeeklyRule,
  findDatedWindowsByResourceId,
  createNewDatedWindow,
  updateExistingDatedWindow,
  deleteExistingDatedWindow,
  findExceptionsByResourceId,
  createNewException,
  updateExistingException,
  deleteExistingException,
  deleteExceptionByDate,
} from '../../domain/booking/availability.js';

/**
 * GET /availability/get-days
 * query: resourceId (required), from (ISO), to (ISO)
 */
export const getAvailableDaysHandler = async (req, res) => {
  const { resourceId, start, end } = req.query;

  if (!resourceId) {
    const bad = new BadRequestEvent(req.user, EVENT_MESSAGES.badRequest, EVENT_MESSAGES.missingFields);
    myEmitterErrors.emit('error', bad);
    return sendMessageResponse(res, bad.code, bad.message);
  }

  const from = start ? new Date(start) : undefined;
  const to = end ? new Date(end) : undefined;

  try {
    const foundAvailableDays = await findAvailableDays(resourceId, from, to);

    try {
      myEmitterBookings.emit('availability:get-days', req.user);
    } catch (_) {}

    sendDataResponse(res, 200, { availableDays: foundAvailableDays });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Get available days failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/**
 * GET /availability/get-slots
 * query: resourceId (required), date (ISO local date e.g. 2025-09-18)
 */
export const getAvailableSlotsHandler = async (req, res) => {
  const { resourceId, date } = req.query;

  if (!resourceId || !date) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundSlots = await findAvailableSlots(resourceId, date);

    if (!foundSlots || foundSlots.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.openingTimesNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('availability:get-slots', req.user);
    sendDataResponse(res, 200, { slots: foundSlots });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Get available slots failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const listRulesHandler = async (req, res) => {
  const { resourceId } = req.params;

  if (!resourceId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundRules = await findRulesByResourceId(resourceId);

    if (!foundRules || foundRules.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('rules:list', req.user);
    sendDataResponse(res, 200, { rules: foundRules });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'List resource rules failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* ============================================
   [ADMIN] Create a weekly rule
   POST /admin/create-resource-rule/:resourceId
   Body: { day, open, start?, end? }
   ============================================ */
export const createRuleHandler = async (req, res) => {
  const { resourceId } = req.params;
  const { day, open, start, end } = req.body || {};

  if (
    !resourceId ||
    day === undefined ||
    open === undefined ||
    (open === true && (!start || !end))
  ) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const createdRule = await createNewWeeklyRule(resourceId, {
      day,
      open,
      start: open ? start : null,
      end: open ? end : null,
    });

    if (!createdRule) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.malformedData
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('rules:create', req.user);
    sendDataResponse(res, 201, { rule: createdRule });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Create resource rule failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* ============================================
   [ADMIN] Update a weekly rule
   PATCH /admin/update-resource-rule/:resourceId/:ruleId
   Body: partial { day?, open?, start?, end? }
   ============================================ */
export const updateRuleHandler = async (req, res) => {
  const { resourceId, ruleId } = req.params;
  const updates = req.body || {};

  if (!resourceId || !ruleId || Object.keys(updates).length === 0) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  if (
    updates.open === true &&
    (updates.start === undefined || updates.end === undefined)
  ) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.malformedData
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const updatedRule = await updateExistingWeeklyRule(ruleId, {
      day: updates.day ?? undefined,
      open: updates.open ?? undefined,
      start: updates.open === false ? null : updates.start ?? undefined,
      end: updates.open === false ? null : updates.end ?? undefined,
    });

    if (!updatedRule) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('rules:update', req.user);
    sendDataResponse(res, 200, { rule: updatedRule });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Update resource rule failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* ============================================
   [ADMIN] Delete a weekly rule
   DELETE /admin/delete-resource-weekly-rule/:ruleId
   ============================================ */
export const deleteRuleHandler = async (req, res) => {
  const { ruleId } = req.params;

  if (!ruleId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const deletedRule = await deleteExistingWeeklyRule(ruleId);

    if (!deletedRule) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('rules:delete', req.user);
    sendDataResponse(res, 200, { message: 'Successfully deleted weekly rule' });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Delete resource rule failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};


/* =====================================================
   [ADMIN] List dated windows (one-off open hours)
   GET /admin/list-dated-windows/:resourceId
   ===================================================== */
export const listDatedWindowsHandler = async (req, res) => {
  const { resourceId } = req.params;

  if (!resourceId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundWindows = await findDatedWindowsByResourceId(resourceId);

    if (!foundWindows || foundWindows.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('windows:list', req.user);
    sendDataResponse(res, 200, { windows: foundWindows });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'List dated windows failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =====================================================
   [ADMIN] Create a dated window (custom open hours)
   POST /admin/create-dated-window/:resourceId
   Body: { date, open, start?, end? }
   ===================================================== */
export const createDatedWindowHandler = async (req, res) => {
  const { resourceId } = req.params;
  const { date, open, start, end } = req.body || {};

  if (!resourceId || !date || open === undefined) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  if (open === true && (!start || !end)) {
    const malformed = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.malformedData
    );
    myEmitterErrors.emit('error', malformed);
    return sendMessageResponse(res, malformed.code, malformed.message);
  }

  try {
    const createdWindow = await createNewDatedWindow(resourceId, {
      date,
      open,
      start: open ? start : null,
      end: open ? end : null,
    });

    if (!createdWindow) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.malformedData
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('windows:create', req.user);
    sendDataResponse(res, 201, { window: createdWindow });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Create dated window failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =====================================================
   [ADMIN] Update a dated window
   PATCH /admin/update-dated-window/:resourceId/:windowId
   Body (partial): { date?, open?, start?, end? }
   ===================================================== */
export const updateDatedWindowHandler = async (req, res) => {
  const { resourceId, windowId } = req.params;
  const updates = req.body || {};

  if (!resourceId || !windowId || Object.keys(updates).length === 0) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  if (
    updates.open === true &&
    (updates.start === undefined || updates.end === undefined)
  ) {
    const malformed = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.malformedData
    );
    myEmitterErrors.emit('error', malformed);
    return sendMessageResponse(res, malformed.code, malformed.message);
  }

  try {
    const updatedWindow = await updateExistingDatedWindow(windowId, {
      date: updates.date ?? undefined,
      open: updates.open ?? undefined,
      start: updates.open === false ? null : updates.start ?? undefined,
      end: updates.open === false ? null : updates.end ?? undefined,
    });

    if (!updatedWindow) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('windows:update', req.user);
    sendDataResponse(res, 200, { window: updatedWindow });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Update dated window failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =====================================================
   [ADMIN] Delete a dated window
   DELETE /admin/delete-dated-window/:resourceId/:windowId
   ===================================================== */
export const deleteDatedWindowHandler = async (req, res) => {
  const { resourceId, windowId } = req.params;

  if (!resourceId || !windowId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const deletedWindow = await deleteExistingDatedWindow(windowId);

    if (!deletedWindow) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('windows:delete', req.user);
    sendDataResponse(res, 200, {
      message: 'Successfully deleted dated window',
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Delete dated window failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] List exceptions for a resource
export const listExceptionsHandler = async (req, res) => {
  const { resourceId } = req.params;

  try {
    const foundExceptions = await findExceptionsByResourceId(resourceId);

    if (!foundExceptions || foundExceptions.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.exceptionsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('exceptions:list', req.user);
    return sendDataResponse(res, 200, { exceptions: foundExceptions });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `List exceptions failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Create an exception
export const createExceptionHandler = async (req, res) => {
  const { resourceId } = req.params;
  const { date, start, end, reason } = req.body;

  if (!date) {
    return sendDataResponse(res, 400, {
      message: 'Missing date for exception.',
    });
  }

  try {
    const createdException = await createNewException(resourceId, {
      date,
      start,
      end,
      reason,
    });

    if (!createdException) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.createExceptionFail
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('exceptions:create', req.user);
    return sendDataResponse(res, 201, { exception: createdException });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Create exception failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Update an exception
export const updateExceptionHandler = async (req, res) => {
  const { exceptionId } = req.params;
  const { date, start, end, reason } = req.body;

  try {
    const updatedException = await updateExistingException(exceptionId, {
      date,
      start,
      end,
      reason,
    });

    if (!updatedException) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.exceptionsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('exceptions:update', req.user);
    return sendDataResponse(res, 200, { exception: updatedException });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Update exception failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Delete an exception
export const deleteExceptionHandler = async (req, res) => {
  const { exceptionId } = req.params;

  try {
    const deletedException = await deleteExistingException(exceptionId);

    if (!deletedException) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.exceptionsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('exceptions:delete', req.user);
    return sendDataResponse(res, 200, {
      message: `Successfully deleted exception`,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete exception failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

// [ADMIN] Delete a full-day exception by date
export const deleteExceptionByDateHandler = async (req, res) => {
  const { resourceId, date } = req.params;

  try {
    const deleted = await deleteExceptionByDate(resourceId, date);

    if (!deleted) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.exceptionsNotFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('exceptions:delete-by-date', req.user);
    return sendDataResponse(res, 200, {
      message: `Successfully deleted exception for date ${date}`,
    });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      `Delete exception by date failed`
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
