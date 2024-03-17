const { RABBIT_MQ_CONFIG } = require("../../constant");
const { RabbitMQClass } = require("../../external/rabbitmq");

class NotificationService extends RabbitMQClass {
  constructor() {
    super();
    this.noti_queue;
    this.init();
  }

  //set up queue for notification
  async init() {
    if (!RabbitMQClass.channel) {
      await RabbitMQClass.connect();
    }
    await RabbitMQClass.channel.assertExchange(
      RABBIT_MQ_CONFIG.NOTIFICATION_EX_NAME,
      "direct",
      {
        durable: true,
      }
    );
    this.noti_queue = await RabbitMQClass.channel.assertQueue(
      RABBIT_MQ_CONFIG.NOTI_QUEUE_NAME,
      {
        durable: true,
        deadLetterExchange: RABBIT_MQ_CONFIG.DLX_EX_NAME,
        deadLetterRoutingKey: RABBIT_MQ_CONFIG.DLX_ROUTING_KEY,
        messageTtl: RABBIT_MQ_CONFIG.TTL_VALUE,
      }
    );
    await RabbitMQClass.channel.bindQueue(
      this.noti_queue.queue,
      RABBIT_MQ_CONFIG.NOTIFICATION_EX_NAME
    );
  }
  async publishMessage(msg) {
    await super.publishMessage(this.noti_queue.queue, msg);
  }
}
const notificationServiceIns = new NotificationService();

module.exports = notificationServiceIns;
