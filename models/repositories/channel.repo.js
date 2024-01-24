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
  static async updateChannel(channelId, updateData) {
    return await Channel.findByIdAndUpdate(channelId, updateData, { new: true }).exec();
  }
  static async findOneChannel(query) {
    return await Channel.findOne(query).exec();
  }
  static async createChannel(channelData) {
    const channel = new Channel(channelData);
    return await channel.save();
  }
  static async findOrCreateChannel(channelName = "", memberIds) {
    let channel = await Channel.findOne({ memberIds: { $all: memberIds } });
    if (!channel) {
      channel = new Channel({
        channelName,
        memberIds,
        channelMessages: [],
      });
      await channel.save();
    } else {
      channel.isInWaitingList = true;
      await channel.save();
    }
    return channel;
  }
}

module.exports = ChannelRepository;
