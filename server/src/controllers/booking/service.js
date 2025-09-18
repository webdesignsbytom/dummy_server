import {
  findAllServices,
  findServiceById,
  createNewService,
  updateExistingService,
  deleteExistingService,
} from '../../domain/booking/service.js';
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
   [ADMIN] List services
   GET /admin/list-services
   ========================= */
export const listServicesHandler = async (req, res) => {
  try {
    const foundServices = await findAllServices();

    if (!foundServices || foundServices.length === 0) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('list-services', req.user);
    return sendDataResponse(res, 200, { services: foundServices });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'List services failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Get a service
   GET /admin/get-service-by-id/:serviceId
   ========================= */
export const getServiceHandler = async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundService = await findServiceById(serviceId);

    if (!foundService) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('get-service-by-id', req.user);
    return sendDataResponse(res, 200, { service: foundService });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Get service failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Create a service
   POST /admin/create-service
   Body: { name, description?, price?, duration?, resourceId? }
   ========================= */
export const createServiceHandler = async (req, res) => {
  const { name, description, price, duration, resourceId } = req.body || {};

  if (!name) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const createdService = await createNewService({
      name,
      description,
      price,
      duration,
      resourceId,
    });

    if (!createdService) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('create-service', req.user);
    return sendDataResponse(res, 201, { service: createdService });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Create service failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Update a service
   PATCH /admin/update-service/:serviceId
   Body: partial fields
   ========================= */
export const updateServiceHandler = async (req, res) => {
  const { serviceId } = req.params;
  const updates = req.body || {};

  if (!serviceId || !updates || Object.keys(updates).length === 0) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundService = await findServiceById(serviceId);

    if (!foundService) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedService = await updateExistingService(serviceId, updates);

    if (!updatedService) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('update-service', req.user);
    return sendDataResponse(res, 200, { service: updatedService });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Update service failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Delete a service
   DELETE /admin/delete-service/:serviceId
   ========================= */
export const deleteServiceHandler = async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundService = await findServiceById(serviceId);

    if (!foundService) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedService = await deleteExistingService(serviceId);

    if (!deletedService) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('delete-service', req.user);
    return sendDataResponse(res, 200, { message: 'Successfully deleted service' });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Delete service failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};
