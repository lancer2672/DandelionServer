const { NOTIFICATION_TYPE } = require("../../constant");

class NotificationFactory {
  // key - class
  static notificationRegistry = {};
  static registryMessageType = (type, classRef) => {
    NotificationFactory.notificationRegistry[type] = classRef;
  };
  static async createNotification(type, payload) {
    const notificationClass = new this.notificationRegistry[type]();
    return new notificationClass(payload);
  }
}

class NotificationClass {
  constructor(type, description, title, receiverId, senderId, payload = null) {
    this.type = type;
    this.description = description;
    this.title = title;
    this.receiverId = receiverId;
    this.senderId = senderId;
    this.payload = payload ? JSON.parse(payload) : null;
  }
}

class ChatNotification extends NotificationClass {}
class PostNotification extends NotificationClass {}
class FriendRequestNotification extends NotificationClass {}

//register notification type
NotificationFactory.registryMessageType(
  NOTIFICATION_TYPE.CHAT,
  ChatNotification
);
NotificationFactory.registryMessageType(
  NOTIFICATION_TYPE.FRIEND_REQUEST,
  FriendRequestNotification
);
NotificationFactory.registryMessageType(
  NOTIFICATION_TYPE.POST,
  PostNotification
);

module.exports = { NotificationClass, NotificationFactory };
