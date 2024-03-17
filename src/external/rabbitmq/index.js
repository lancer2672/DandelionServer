const amqp = require("amqplib");
const config = require("../../config/appConfig");
const { RABBIT_MQ_CONFIG } = require("../../constant");

class RabbitMQClass {
  constructor() {
    this.channel = null;
  }
  async connect(url = config.rabbitMQ.url) {
    try {
      const connection = await amqp.connect(url);
      if (!connection) throw new Error("Cannot connect to rabbitMQ");
      this.channel = await connection.createChannel();
    } catch (error) {
      throw new Error(`Cannot connect to rabbitMQ error: ${error}`);
    }
  }
  async publishMessage(msg) {
    try {
      if (!msg) return;

      await this.channel.assertExchange(
        RABBIT_MQ_CONFIG.NOTIFICATION_EX_NAME,
        "direct",
        {
          durable: true,
        }
      );
      const noti_queue = await this.channel.assertQueue(
        RABBIT_MQ_CONFIG.NOTI_QUEUE_NAME,
        {
          durable: true,
          deadLetterExchange: RABBIT_MQ_CONFIG.DLX_EX_NAME,
          deadLetterRoutingKey: RABBIT_MQ_CONFIG.DLX_ROUTING_KEY,
          messageTtl: RABBIT_MQ_CONFIG.TTL_VALUE,
        }
      );
      await this.channel.bindQueue(
        noti_queue.queue,
        RABBIT_MQ_CONFIG.NOTIFICATION_EX_NAME
      );

      //send
      await this.channel.sendToQueue(noti_queue.queue, Buffer.from(msg));
    } catch (error) {
      throw new Error(`Send message failed: ${error}`);
    }
  }
}

const rabbitMQIns = new RabbitMQClass();
rabbitMQIns
  .connect()
  .then(() => {
    console.log("Connected to RabbitMQ");
    return rabbitMQIns.publishMessage("HEllo");
  })
  .then(() => {
    console.log("Message is SENT!!!");
  })
  .catch((er) => {
    console.log("Message send failed", er);
  });
module.exports = rabbitMQIns;
