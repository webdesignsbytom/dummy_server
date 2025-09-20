// Response strings
import { RESPONSE_MESSAGES } from '../../utils/responses.js';
import { createErrorEvent } from './events.js';

// --- SAFE HELPERS ---
const normalizeUser = (user) => {
  if (user && typeof user === 'object') {
    return {
      id: user.id ?? null,
      email: user.email ?? 'anonymous',
      role: user.role ?? 'USER',
    };
  }
  return { id: null, email: 'anonymous', role: 'USER' };
};

// --- GENERIC ERROR EVENT CREATOR ---
export const createGenericErrorEvent = async (errorEvent) => {
  const u = normalizeUser(errorEvent?.user || {});
  const message =
    errorEvent?.message || `An unknown error occurred for ${u.email}`;
  const code = errorEvent?.code || 500;

  await createErrorEvent({
    user: u,
    role: u.role,
    action: 'Generic Error',
    message,
    code,
  });
};

// Define error event classes
class ErrorEventBase {
  constructor(user, topic) {
    this.user = user;
    this.topic = topic;
  }
}

export class BadRequestEvent extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 400;
    this.message = RESPONSE_MESSAGES.BadRequestEvent;
  }
}

export class NoValidationEvent {
  constructor(topic = 'validate-authentication') {
    this.user = null;
    this.topic = topic;
    this.code = 401;
    this.message = RESPONSE_MESSAGES.NoValidationEvent;
  }
}

export class NoPermissionEvent extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 403;
    this.message = RESPONSE_MESSAGES.NoPermissionEvent;
  }
}

export class NotFoundEvent extends ErrorEventBase {
  constructor(user, topic, target) {
    super(user, topic);
    this.code = 404;
    this.message = `${target} ${RESPONSE_MESSAGES.NotFoundEvent}`;
  }
}

export class MissingFieldEvent extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 404;
    this.message = RESPONSE_MESSAGES.MissingFieldEvent;
  }
}

export class ConflictEvent extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 409;
    this.message = RESPONSE_MESSAGES.ConflictEvent;
  }
}

export class DeactivatedUserEvent extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 400;
    this.message = RESPONSE_MESSAGES.DeactivatedUserEvent;
  }
}

export class ServerErrorEvent extends ErrorEventBase {
  constructor(user = 'visitor', topic) {
    super(user, topic);
    this.code = 500;
    this.message = RESPONSE_MESSAGES.ServerErrorEvent;
  }
}

export class ServerConflictError extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 500;
    this.message = RESPONSE_MESSAGES.ServerErrorEvent;
  }
}

export class RegistrationServerErrorEvent extends ErrorEventBase {
  constructor(topic) {
    super(topic);
    this.code = 500;
    this.message = RESPONSE_MESSAGES.ServerErrorEvent;
  }
}

export class LoginServerErrorEvent extends ErrorEventBase {
  constructor(user, topic) {
    super(user, topic);
    this.code = 500;
    this.message = RESPONSE_MESSAGES.ServerErrorEvent;
  }
}

export class CreateEventError extends ServerErrorEvent {
  constructor(userId, topic, message = RESPONSE_MESSAGES.CreateEventError) {
    super(userId, topic);
    this.code = 403;
    this.message = message;
  }
}

export class OtherErrorEvent extends ErrorEventBase {
  constructor(user, topic, code, message) {
    super(user, topic);
    this.code = code;
    this.message = message;
  }
}
