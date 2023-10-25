const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");

exports.handleUploadImage = async (req, res) => {
  try {
    if (req.files) {
      const fileUrls = req.files.map((file) => file.path);
      new OK({
        message: "User logged in successfully",
        data: { fileUrls: fileUrls },
      }).send(res);
    } else {
      throw new BadRequestError("No files uploaded");
    }
  } catch (error) {
    throw new InternalServerError();
  }
};
exports.handleUploadVideo = async (req, res) => {
  try {
    if (req.file) {
      new OK({
        message: "User logged in successfully",
        data: { fileUrl: req.file.path },
      }).send(res);
    } else {
      throw new BadRequestError("No files uploaded");
    }
  } catch (error) {
    throw new InternalServerError();
  }
};
