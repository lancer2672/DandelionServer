const multer = require("multer");

const imageMemoryStorage = multer.memoryStorage();
const videoMemoryStorage = multer.memoryStorage();
const uploadImage = multer({ storage: imageMemoryStorage });
const uploadVideo = multer({ storage: videoMemoryStorage });

module.exports = { uploadImage, uploadVideo };
