const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rtoken-id",
};

const MessageType = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
  CALL_HISTORY: "callHistory",
};

const FriendRequestStatus = {
  ACCEPT:"accept",
  DECLINE:"decline",
  PENDING:"pending",

}
module.exports = {
  HEADER,
  MessageType,
  FriendRequestStatus,
};
