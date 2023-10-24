const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { uploadImage, uploadVideo } = require("../middleware/upload");
const UploadController = require("../controllers/upload.controller");

const router = express.Router();

router.post(
  "/image",
  verifyToken,
  uploadImage.single("image"),
  UploadController.handleUploadImage
);
router.post(
  "/video",
  verifyToken,
  uploadVideo.single("video"),
  UploadController.handleUploadVideo
);

module.exports = router;
