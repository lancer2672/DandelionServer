const multer = require("multer");

function upload(req, res, next) {
  var imageName;
  var uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      imageName = file.originalname;
      //imageName += "_randomstring"
      cb(null, imageName);
    },
  });

  var uploader = multer({ storage: uploadStorage });

  var uploadFile = upload.single("image");

  uploadFile(req, res, function (err) {
    req.imageName = imageName;
    req.uploadError = err;
    next();
  });
}

module.exports = upload;
