const { BadRequestError } = require("../classes/error/ErrorResponse");
const { MessageType } = require("../constant");
const {
  CallMessageSchema,
  TextMessageSchema,
  ImageMessageSchema,
  VideoMessageSchema,
  Message,
} = require("../models/message.model");

class MessageFactory {
  static async createMessage(type, payload) {
    switch (type) {
      case MessageType.TEXT:
        return new TextMessage(payload).createMessage();
      case MessageType.IMAGE:
        return new ImageMessage(payload).createMessage();
      case MessageType.VIDEO:
        return new VideoMessage(payload).createMessage();
      case MessageType.CALL_HISTORY:
        return new CallMessage(payload).createMessage();
      default:
        throw new Error("Invalid message type");
    }
  }
}

class MessageClass {
  constructor(message) {
    this.channelId = message.channelId;
    this.userId = message.userId;
    this.type = message.type;
    this.isSeen = message.isSeen;
    this.createdAt = message.createdAt;
    this.attrs = message.attrs;
  }

  async createMessage() {
    return await Message.create(this);
  }
}

class TextMessage extends MessageClass {
  async createMessage() {
    return super.createMessage();
  }
}
class ImageMessage extends MessageClass {
  async createMessage() {
    return super.createMessage();
  }
}

class VideoMessage extends MessageClass {
  async createMessage() {
    return super.createMessage();
  }
}

class CallMessage extends MessageClass {
  async createMessage() {
    return super.createMessage();
  }
}
module.exports = MessageFactory;
