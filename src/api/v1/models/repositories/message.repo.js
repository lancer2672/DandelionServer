const { Message } = require("../message.model");

class MessageRepository {
  static async getUserMessage({ query, limit, skip }) {
    return await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip || 0)
      .limit(limit || 10)
      .exec();
  }
}

module.exports = MessageRepository;
