const { getSelectData } = require("../../../../utils");
const Channel = require("../channel.model");
class ChannelRepository {
  static async findChannels({ query, limit = 10, skip = 0, select }) {
    return await Channel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .exec();
  }
  static async findMemberInChannel({ query, limit = 10, skip = 0, select }) {
    return await Channel.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .exec();
  }
  static async updateChannel(channelId, updateData, session = null) {
    return await Channel.findByIdAndUpdate(channelId, updateData, {
      new: true,
    })
      .session(session)
      .exec();
  }
  static async updateChannelWithSession(channelId, updateData, session) {
    return await Channel.findByIdAndUpdate(channelId, updateData, {
      new: true,
    })
      .session(session)
      .exec();
  }
  static async findChannel(query, session = null) {
    return await Channel.findOne(query).session(session).exec();
  }
  static async createChannel(channelData) {
    const channel = new Channel(channelData);
    return await channel.save();
  }
  static async findOrCreateChannel(
    channelName = "",
    memberIds,
    session = null
  ) {
    let channel = await Channel.findOne({ memberIds: { $all: memberIds } });
    if (!channel) {
      channel = new Channel({
        channelName,
        memberIds,
        channelMessages: [],
      });
      await channel.save({ session });
    } else {
      channel.isInWaitingList = true;
      await channel.save({ session });
    }
    return channel;
  }
}

module.exports = ChannelRepository;
