const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const S3ClientIns = require("../s3Client/index");

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

    const fileIds = results.reduce((acc, item) => {
      acc.push(item.fileId);
      return acc;
    }, []);

    new OK({
      data: { fileIds: fileIds },
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

exports.handleGetFileUrl = async (req, res) => {
  console.log("handle upload image: req.file", req.body);
  const { fileIds } = req.body;
  if (fileIds) {
    const getUrlPromises = fileIds.map((fileId) => {
      return S3ClientIns.getSignedUrl(fileId);
    });
    const fileUrls = await Promise.all(getUrlPromises);

    console.log("results", fileUrls);
    new OK({
      data: { fileUrls: fileUrls },
    }).send(res);
  } else {
    throw new BadRequestError();
  }
};
