class NotificationBuilder {
  constructor(notification) {
    this.notification = notification;
  }
  withPayload(payload) {
    this.notification.payload = JSON.parse(payload);
    return this;
  }
}
module.exports = NotificationBuilder;
