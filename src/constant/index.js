const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rtoken-id",
};

const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  CALL_HISTORY: "callHistory",
};

const FRIEND_REQUEST_STATUS = {
  ACCEPT: "accept",
  DECLINE: "decline",
  PENDING: "pending",
};
const REDIS_CONNECTION_STATUS = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnect",
  ERROR: "error",
};
const REDIS_CONNECTION_TIMEOUT = 10000;
module.exports = {
  HEADER,
  REDIS_CONNECTION_TIMEOUT,
  MESSAGE_TYPE,
  FRIEND_REQUEST_STATUS,
  REDIS_CONNECTION_STATUS,
};
