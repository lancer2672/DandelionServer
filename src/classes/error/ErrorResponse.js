const StatusCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
};

const Response = {
  BAD_REQUEST: "Bad request error",
  UNAUTHORIZED: "Unauthorized error",
  CONFLICT: "Conflict error",
  NOT_FOUND: "Not found error",
  INTERNAL_SERVER_ERROR: "Internal server error",
  FORBIDDEN: "Forbidden error",
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = Response.BAD_REQUEST, status = StatusCode.BAD_REQUEST) {
    super(message, status);
  }
}
class NotFoundError extends ErrorResponse {
  constructor(message = Response.NOT_FOUND, status = StatusCode.NOT_FOUND) {
    super(message, status);
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(message = Response.FORBIDDEN, status = StatusCode.FORBIDDEN) {
    super(message, status);
  }
}
class UnauthorizedError extends ErrorResponse {
  constructor(
    message = Response.UNAUTHORIZED,
    status = StatusCode.UNAUTHORIZED
  ) {
    super(message, status);
  }
}
class ConflictError extends ErrorResponse {
  constructor(message = Response.CONFLICT, status = StatusCode.CONFLICT) {
    super(message, status);
  }
}
class InternalServerError extends ErrorResponse {
  constructor(
    message = Response.INTERNAL_SERVER_ERROR,
    status = StatusCode.INTERNAL_SERVER_ERROR
  ) {
    super(message, status);
  }
}

module.exports = {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
  ForbiddenError,
};
