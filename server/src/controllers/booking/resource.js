import {
  findAllResources,
  findResourceById,
  createNewResource,
  updateResourceById,
  deleteResourceById,
  findResourceByIdWithTags,
} from '../../domain/booking/resource.js';
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
   [ADMIN] List resources
   GET /admin/list-resources
   ========================= */
export const listResourcesHandler = async (req, res) => {
  console.log('AAAA');
  try {
    const foundResources = await findAllResources();
console.log('found', foundResources);
    if (!foundResources) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('list-resources', req.user);
    return sendDataResponse(res, 200, { resources: foundResources });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'List resources failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Get resource by ID
   GET /admin/get-resource-by-id/:resourceId
   ========================= */
export const getResourceHandler = async (req, res) => {
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
    const foundResource = await findResourceById(resourceId);

    if (!foundResource) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    myEmitterBookings.emit('get-resource-by-id', req.user);
    return sendDataResponse(res, 200, { resource: foundResource });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Get resource failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};


export const attachTagsToResourceHandler = async (req, res) => {
  const { resourceId } = req.params;
  const { tags } = req.body;

  if (!resourceId || !Array.isArray(tags) || !tags.length) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundResource = await findResourceById(resourceId);

    if (!foundResource) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.userNotFound // generic message pool—keeps everything from EVENT_MESSAGES
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedResource = await attachTagsToResource(resourceId, tags);

    if (!updatedResource) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.malformedData
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    // fire booking/resource domain event (non-blocking)
    try {
      myEmitterBookings.emit('resources:attach-tags', {
        user: req.user,
        resourceId,
        tags,
      });
    } catch (_) {}

    sendDataResponse(res, 200, { resource: updatedResource });
  } catch (err) {
    const serverError = new ServerErrorEvent(
      req.user,
      'Attach resource tags failed'
    );
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Create resource
   POST /admin/create-resource
   ========================= */
export const createResourceHandler = async (req, res) => {
  const { name, description, capacity, isActive, metadata } = req.body || {};

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
    const createdResource = await createNewResource({
      name,
      description,
      capacity,
      isActive,
      metadata,
    });

    if (!createdResource) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('create-resource', req.user);
    return sendDataResponse(res, 201, { resource: createdResource });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Create resource failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Update resource
   PATCH /admin/update-resource/:resourceId
   ========================= */
export const updateResourceHandler = async (req, res) => {
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
    const foundResource = await findResourceById(resourceId);

    if (!foundResource) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedResource = await updateResourceById(resourceId, req.body || {});

    if (!updatedResource) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('update-resource', req.user);
    return sendDataResponse(res, 200, { resource: updatedResource });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Update resource failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

/* =========================
   [ADMIN] Delete resource
   DELETE /admin/delete-resource/:resourceId
   ========================= */
export const deleteResourceHandler = async (req, res) => {
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
    const foundResource = await findResourceById(resourceId);

    if (!foundResource) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const deletedResource = await deleteResourceById(resourceId);

    if (!deletedResource) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('delete-resource', req.user);
    return sendDataResponse(res, 200, { message: 'Successfully deleted resource' });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Delete resource failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};

export const detachTagFromResourceHandler = async (req, res) => {
  const { resourceId, tagId } = req.params;

  if (!resourceId || !tagId) {
    const badRequest = new BadRequestEvent(
      req.user,
      EVENT_MESSAGES.badRequest,
      EVENT_MESSAGES.missingFields
    );
    myEmitterErrors.emit('error', badRequest);
    return sendMessageResponse(res, badRequest.code, badRequest.message);
  }

  try {
    const foundResource = await findResourceByIdWithTags(resourceId);

    if (!foundResource) {
      const notFound = new NotFoundEvent(
        req.user,
        EVENT_MESSAGES.notFound,
        EVENT_MESSAGES.notFound
      );
      myEmitterErrors.emit('error', notFound);
      return sendMessageResponse(res, notFound.code, notFound.message);
    }

    const updatedResource = await detachTagFromResource(resourceId, tagId);

    if (!updatedResource) {
      const badRequest = new BadRequestEvent(
        req.user,
        EVENT_MESSAGES.badRequest,
        EVENT_MESSAGES.badRequest
      );
      myEmitterErrors.emit('error', badRequest);
      return sendMessageResponse(res, badRequest.code, badRequest.message);
    }

    myEmitterBookings.emit('detach-resource-tag', req.user);
    return sendDataResponse(res, 200, { resource: updatedResource });
  } catch (err) {
    const serverError = new ServerErrorEvent(req.user, 'Detach tag failed');
    myEmitterErrors.emit('error', serverError);
    sendMessageResponse(res, serverError.code, serverError.message);
    throw err;
  }
};