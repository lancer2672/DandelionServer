const { NOTIFICATION_TYPE } = require("../../constant");

class NotificationFactory {
  // key - class
  static notificationRegistry = {};
  static registryNotificationType = (type, classRef) => {
    NotificationFactory.notificationRegistry[type] = classRef;
  };
  static createNotification(type, payload) {
    console.log("createNotification", { type, payload });
    const notificationClass = this.notificationRegistry[type];
    return new notificationClass({ type, ...payload });
  }
}

class NotificationClass {
  constructor({
    type,
    description,
    receiverId,
    senderId,
    title = "Thông báo mới",
    payload = null,
  }) {
    this.notification = {
      type,
      description,
      title,
      receiverId,
      senderId,
      payload,
    };
  }
  stringify() {
    console.log("THIS.NOTIFIACTION", this.notification);
    return JSON.stringify(this.notification);
  }
}

class ChatNotification extends NotificationClass {}
class PostNotification extends NotificationClass {}
class FriendRequestNotification extends NotificationClass {}

//register notification type
NotificationFactory.registryNotificationType(
  NOTIFICATION_TYPE.CHAT,
  ChatNotification
);
NotificationFactory.registryNotificationType(
  NOTIFICATION_TYPE.FRIEND_REQUEST,
  FriendRequestNotification
);
NotificationFactory.registryNotificationType(
  NOTIFICATION_TYPE.POST,
  PostNotification
);

module.exports = { NotificationClass, NotificationFactory };
