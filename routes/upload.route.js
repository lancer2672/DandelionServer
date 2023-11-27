const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { uploadImage, uploadVideo } = require("../middleware/upload");
const UploadController = require("../controllers/upload.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/image",
  verifyToken,
  uploadImage.array("image"),
  errorHandler(UploadController.handleUploadImage)
);
router.post(
  "/video",
  verifyToken,
  uploadVideo.single("video"),
  errorHandler(UploadController.handleUploadVideo)
);
router.post(
  "/get-url",
  verifyToken,
  errorHandler(UploadController.handleGetFileUrl)
);
module.exports = router;
