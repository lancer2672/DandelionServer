const { BadRequestError } = require("../classes/error/ErrorResponse");
const { MessageType } = require("../constant");
const {
  Message,
} = require("../api/v1/models/message.model");

class MessageFactory {
  // key - class
  static messageRegistry = {};
  static registryMessageType = (type, classRef) => {
    MessageFactory.messageRegistry[type] = classRef;
  };
  static async createMessage(type, payload) {
    const messageClass = new this.messageRegistry[type]();
    return new messageClass(payload).createMessage();
  }

  //TODO: Update message
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

//register message type
MessageFactory.registryMessageType(MessageType.TEXT, TextMessage);
MessageFactory.registryMessageType(MessageType.IMAGE, ImageMessage);
MessageFactory.registryMessageType(MessageType.VIDEO, VideoMessage);
MessageFactory.registryMessageType(MessageType.CALL_HISTORY, CallMessage);

module.exports = MessageFactory;
