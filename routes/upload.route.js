const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/upload");
const UploadController = require("../controllers/upload.controller");

const router = express.Router();

router.post(
  "/",
  verifyToken,
  upload.single("video"),
  UploadController.handleUpload
);

module.exports = router;
