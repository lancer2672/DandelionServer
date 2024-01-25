const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the image.
 *         url:
 *           type: string
 *           description: The URL of the image.
 *       example:
 *         name: "Image 1"
 *         url: "https://example.com/image1.jpg"
 *     Video:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the video.
 *         url:
 *           type: string
 *           description: The URL of the video.
 *         duration:
 *           type: number
 *           description: The duration of the video in seconds.
 *       example:
 *         name: "Video 1"
 *         url: "https://example.com/video1.mp4"
 *         duration: 120
 */

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
