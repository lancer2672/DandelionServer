const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { MessageSchema } = require("./message.model");

/**
 * @swagger
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       required:
 *         - channelName
 *         - memberIds
 *         - lastUpdate
 *         - isInWaitingList
 *         - channelMessages
 *       properties:
 *         channelName:
 *           type: string
 *           description: The name of the channel.
 *         memberIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The IDs of the members in the channel.
 *         lastUpdate:
 *           type: string
 *           format: date-time
 *           description: The last update time of the channel.
 *         isInWaitingList:
 *           type: boolean
 *           description: If user A and B are not friends, this is true.
 *         channelMessages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *           description: The messages in the channel.
 *       example:
 *         channelName: "Channel 1"
 *         memberIds: ["60d0fe4f7439346e18c6343a"]
 *         lastUpdate: "2023-12-05T08:39:32.000Z"
 *         isInWaitingList: false
 *         channelMessages: []
 */

const ChannelSchema = new Schema(
  {
    channelName: {
      type: String,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
    //If user A and B are not friend -> true
    isInWaitingList: {
      type: Boolean,
      default: false,
    },
    channelMessages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("channel", ChannelSchema);
