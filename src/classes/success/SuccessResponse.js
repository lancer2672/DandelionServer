const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const Response = {
  CREATED: "Created",
  OK: "Success",
};

class SuccessResponse {
  constructor({ message, data = {}, statusCode = StatusCode.OK }) {
    this.message = message ? message : Response.OK;
    this.status = statusCode;
    this.data = data;
  }
  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, data }) {
    super({ message, data });
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({ message, data, statusCode = StatusCode.CREATED }) {
    super({ message, data, statusCode });
  }
}

module.exports = {
  OK,
  CreatedResponse,
};
