const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const S3ClientIns = require("../s3Client/index");
const UserService = require("../services/user.service");
const PostService = require("../services/post.service");
const ChatService = require("../services/chat.service");

exports.handleUploadImage = async (req, res) => {
  console.log("handle upload image: req.file", req.files);
  if (req.files) {
    const uploadPromises = req.files.map((file) => {
      const args = {
        name: file.originalname,
        body: file.buffer,
        minetype: file.mimetype,
      };
      return S3ClientIns.uploadImage(args);
    });
    const results = await Promise.all(uploadPromises);

    const fileData = await Promise.all(
      results.map(async (item) => {
        const url = await S3ClientIns.getSignedUrl(item.fileId);
        return { id: item.fileId, url: url };
      })
    );

    new OK({
      data: { files: fileData },
    }).send(res);
  } else {
    throw new BadRequestError("No files uploaded");
  }
};

exports.handleUploadVideo = async (req, res) => {
  console.log("handle upload video: req.file", req.file);
  if (req.file) {
    const args = {
      name: req.file.originalname,
      body: req.file.buffer,
      mimeType: req.file.mimetype,
    };
    try {
      const result = await S3ClientIns.uploadVideo(args);
      const url = await S3ClientIns.getSignedUrl(result.fileId);
      new OK({
        data: { files: [{ id: result.fileId, url: url }] },
      }).send(res);
    } catch (err) {
      console.error("Error uploading video:", err);
      throw new InternalServerError("Error uploading video");
    }
  } else {
    throw new BadRequestError("No files uploaded");
  }
};

exports.updateUrl = async (req, res) => {
  const { type, ...data } = req.body;

  let resData;
  switch (type) {
    case "user":
      resData = await UserService.updateUrl(data);
      break;
    case "post":
      resData = await PostService.updateUrl(data);
      break;
    case "message":
      resData = await ChatService.updateUrl(data);
      break;
    default:
      throw new BadRequestError("Invalid type");
  }

  new OK({
    message: "URL updated successfully",
    data: resData,
  }).send(res);
};
