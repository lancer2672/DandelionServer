const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SearchHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    searchedUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        searchTime: {
          type: Date,
          default: Date.now,
        },
        deletedAt: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("searchHistory", SearchHistorySchema);
