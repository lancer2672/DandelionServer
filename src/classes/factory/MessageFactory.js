const { BadRequestError } = require("../error/ErrorResponse");
const { MESSAGE_TYPE } = require("../../constant");
const { Message } = require("../../api/v1/models/message.model");

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
  static getNotificationContentByMsgType = (type) => {
    switch (type) {
      case MESSAGE_TYPE.TEXT:
        return (senderName, message) => message;
      case MESSAGE_TYPE.IMAGE:
        return (senderName, message) => `${senderName} đã gửi cho bạn ảnh`;
      case MESSAGE_TYPE.VIDEO:
        return (senderName, message) => `${senderName} đã gửi cho bạn video`;
      case MESSAGE_TYPE.CALL_HISTORY:
        return (senderName, message) => `đã bỏ lỡ cuộc gọi từ ${senderName}`;
      default:
        return "";
    }
  };
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
MessageFactory.registryMessageType(MESSAGE_TYPE.TEXT, TextMessage);
MessageFactory.registryMessageType(MESSAGE_TYPE.IMAGE, ImageMessage);
MessageFactory.registryMessageType(MESSAGE_TYPE.VIDEO, VideoMessage);
MessageFactory.registryMessageType(MESSAGE_TYPE.CALL_HISTORY, CallMessage);

module.exports = { MessageFactory, MessageClass };
