const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      require: true,
      default: [0, 1, 2],
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("apikeys", ApiKeySchema);
