const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

exports.handleUploadImage = async (req, res) => {
  console.log("handle upload image: req.file", req.files);
  if (req.files) {
    const fileUrls = req.files.map((file) => file.path);
    new OK({
      data: { fileUrls: fileUrls },
    }).send(res);
  } else {
    throw new BadRequestError("No files uploaded");
  }
};
exports.handleUploadVideo = async (req, res) => {
  if (req.file) {
    new OK({
      data: { fileUrl: req.file.path },
    }).send(res);
  } else {
    throw new BadRequestError("No files uploaded");
  }
};
