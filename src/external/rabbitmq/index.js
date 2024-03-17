const amqp = require("amqplib");
const config = require("../../config/appConfig");

class RabbitMQClass {
  static connection;
  static channel;

  //singleton
  static async connect(url = config.rabbitMQ.url) {
    if (RabbitMQClass.connection) return RabbitMQClass.connection;
    try {
      RabbitMQClass.connection = await amqp.connect(url);
      if (!RabbitMQClass.connection)
        throw new Error("Cannot connect to rabbitMQ");
      RabbitMQClass.channel = await RabbitMQClass.connection.createChannel();
      console.log("Connected to RabbitMQ");
    } catch (error) {
      throw new Error(`Cannot connect to rabbitMQ error: ${error}`);
    }
  }

  async publishMessage(queue, msg) {
    try {
      //send
      await RabbitMQClass.channel.sendToQueue(queue, Buffer.from(msg));
    } catch (error) {
      throw new Error(`Send message failed: ${error}`);
    }
  }
}

RabbitMQClass.connect();
module.exports = { RabbitMQClass };
