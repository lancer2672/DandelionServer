const multer = require("multer");

var imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/images");
  },
  filename: function (req, file, cb) {
    var extArray = file.mimetype.split("/");
    var extension = extArray[extArray.length - 1];
    cb(null, "image -" + Date.now() + "." + extension);
  },
});

var videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/videos");
  },
  filename: function (req, file, cb) {
    var extArray = file.mimetype.split("/");
    var extension = extArray[extArray.length - 1];
    cb(null, "video -" + Date.now() + "." + extension);
  },
});

var uploadImage = multer({ storage: imageStorage });
var uploadVideo = multer({ storage: videoStorage });

module.exports = { uploadImage, uploadVideo };
