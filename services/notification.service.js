const Notification = require("../models/notification.model");
const admin = require("../firebase/firebaseAdmin");

const NotificationType = {
  POST: "post",
  CHAT: "chat",
  FRIEND_REQUEST: "friend-request",
};

class NotificationService {
  static async sendMulticastMessage(tokens, data) {
    console.log("Data", data);
    await admin.messaging().sendMulticast({
      tokens,
      data: { data },
    });
  }
  static createMessageData(type, messageData) {
    return JSON.stringify({
      type,
      ...messageData,
      createdAt: Date.now().toString(),
    });
  }
  static async sendNotification({ tokens, type, messageData }) {
    const data = this.createMessageData(type, messageData);
    console.log("Data", data);
    await this.sendMulticastMessage(tokens, data);
  }

  // static async sendPostNotification(params) {
  //   const {
  //     receiverId,
  //     senderId,
  //     tokens,
  //     type,
  //     messageData,
  //   } = params

  //   const notification = new Notification({
  //     description: messageData.message,
  //     userIds: [
  //       {
  //         userId: senderId,
  //         createdAt: Date.now(),
  //       },
  //     ],
  //     receiverId: receiverId,
  //     postId: postId,
  //   });
  //   await notification.save();
  //   const data = this.createMessageData(type, messageData);
  //   console.log("Data", data);
  //   await this.sendMulticastMessage(tokens, data);
  // }
}

module.exports = { NotificationService, NotificationType };
