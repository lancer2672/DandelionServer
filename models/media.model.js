const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  name: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
});

const VideoSchema = new Schema({
  name: {
    type: String,
    default: null,
  },
  url: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
  },
});

module.exports = { ImageSchema, VideoSchema };
