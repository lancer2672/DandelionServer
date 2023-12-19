const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const { uploadImage, uploadVideo } = require("../middleware/upload");
const UploadController = require("../controllers/upload.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 */
/**
 * @swagger
 * /upload/image:
 *   post:
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post(
  "/image",
  verifyToken,
  uploadImage.array("image"),
  errorHandler(UploadController.handleUploadImage)
);

/**
 * @swagger
 * /upload/video:
 *   post:
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */
router.post(
  "/video",
  verifyToken,
  uploadVideo.single("video"),
  errorHandler(UploadController.handleUploadVideo)
);

/**
 * @swagger
 * /upload/update-url:
 *   put:
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: URL updated successfully
 */
router.put(
  "/update-url",
  verifyToken,
  errorHandler(UploadController.updateUrl)
);

module.exports = router;
