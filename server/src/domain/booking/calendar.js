import dbClient from '../../utils/dbClient.js';

// [ADMIN] List connected calendars for a resource
export const findCalendarsByResourceId = (resourceId) =>
  dbClient.calendar.findMany({
    where: { resourceId },
    orderBy: { createdAt: 'desc' },
  });

// [ADMIN] Connect a calendar
export const createCalendarConnection = (resourceId, data) =>
  dbClient.calendar.create({
    data: {
      resourceId,
      provider: data.provider,     // e.g. 'GOOGLE'
      externalId: data.externalId, // provider’s calendar id
      label: data.label,
      meta: data.meta ?? {},
      status: 'CONNECTED',
      lastManualSyncAt: null,
      syncRequestedAt: null,
    },
  });

// [SHARED] Find calendar by id (scoped to resource)
export const findCalendarById = (calendarId, resourceId) =>
  dbClient.calendar.findFirst({
    where: { id: calendarId, resourceId },
  });

// [ADMIN] Disconnect a calendar
export const deleteCalendarConnection = (calendarId, resourceId) =>
  dbClient.calendar.delete({
    where: { id: calendarId },
  });

// [ADMIN] Trigger a manual calendar sync (flag + timestamp)
export const triggerManualCalendarSync = (calendarId) =>
  dbClient.calendar.update({
    where: { id: calendarId },
    data: {
      syncRequestedAt: new Date(),
      lastManualSyncAt: new Date(),
    },
  });

// [PUBLIC] Persist webhook call for auditing / async processing
export const recordGoogleCalendarWebhookEvent = (headers, body) =>
  dbClient.calendarWebhookEvent.create({
    data: {
      provider: 'GOOGLE',
      headers: headers ?? {},
      payload: body ?? {},
      receivedAt: new Date(),
    },
  });
