const multer = require("multer");

var imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/images");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/videos");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var uploadImage = multer({ storage: imageStorage });
var uploadVideo = multer({ storage: videoStorage });

module.exports = { uploadImage, uploadVideo };
