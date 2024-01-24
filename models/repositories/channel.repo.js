const { getSelectData } = require("../../utils");
const { Channel } = require("../channel.model");
class ChannelRepository {
  static async findChannels({ query, limit, skip, select }) {
    return await Channel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .exec();
  }
  static async findMemberInChannel({ query, limit, skip, select }) {
    return await Channel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .exec();
  }
}

module.exports = ChannelRepository;
