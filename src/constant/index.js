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

const NOTIFICATION_TYPE = {
  POST: "post",
  CHAT: "chat",
  FRIEND_REQUEST: "friend-request",
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

const RABBIT_MQ_CONFIG = {
  DLX_EX_NAME: "dead-letters-exchange",
  DLX_QUEUE_NAME: "dlx-queue",
  DLX_ROUTING_KEY: "dead-exchange-rkey",

  TTL_VALUE: 5000,

  NOTIFICATION_EX_NAME: "notification-exchange",
  NOTI_QUEUE_NAME: "notification-queue",
  NOTIFICATION_ROUTING_KEY: "notification-rkey",
};
module.exports = {
  HEADER,
  REDIS_CONNECTION_TIMEOUT,
  MESSAGE_TYPE,
  FRIEND_REQUEST_STATUS,
  REDIS_CONNECTION_STATUS,
  RABBIT_MQ_CONFIG,
  NOTIFICATION_TYPE,
};
