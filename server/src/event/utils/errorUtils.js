// Response strings
import { RESPONSE_MESSAGES } from '../../utils/responses.js';
// Error event creation functions
import { createErrorEvent } from './events.js';

// Exported error event creation functions
export const createGenericErrorEvent = async (errorEvent) => {
  await createErrorEvent(errorEvent);
};

export const createLoginErrorEvent = async (errorEvent) => {
  await createErrorEvent(errorEvent, errorEvent.user?.email || 'unknown');
};

export const createResendVerifyErrorEvent = async (errorEvent) => {
  await createErrorEvent(errorEvent, errorEvent.user?.email || 'unknown');
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
