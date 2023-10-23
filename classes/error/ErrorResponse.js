const StatusCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const Response = {
  BAD_REQUEST: "Bad request error",
  UNAUTHORIZED: "Unauthorized error",
  CONFLICT: "Conflict error",
  INTERNAL_SERVER_ERROR: "Internal server error",
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
  InternalServerError,
};
