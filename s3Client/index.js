const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const sharp = require("sharp");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class S3ClientClass {
  constructor() {
    this.bucketRegion = process.env.BUCKET_REGION;
    this.bucketName = process.env.BUCKET_NAME;
    this.accessKey = process.env.ACCESS_KEY;
    this.secretAccess = process.env.SECRET_ACCESS;

    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretAccess,
      },
      region: this.bucketRegion,
    });
  }

  async uploadImage({ name, body, mimeType }) {
    try {
      const randomName = crypto.randomBytes(32).toString("hex");

      // Resize image size if > [1920,1080]
      const buffer = await sharp(body)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();

      const params = {
        Bucket: this.bucketName,
        Key: randomName,
        Body: buffer,
        ContentType: mimeType,
      };

      const uploadCommand = new PutObjectCommand(params);
      const uploadResult = await this.s3.send(uploadCommand);
      console.log("Upload successful:", uploadResult);

      return {
        fileId: randomName,
        uploadResult,
      };
    } catch (err) {
      console.error("Error uploading object:", err);
      throw err;
    }
  }
  async uploadVideo({ name, body, mimeType }) {
    try {
      const randomName = crypto.randomBytes(32).toString("hex");

      const params = {
        Bucket: this.bucketName,
        Key: randomName,
        Body: body,
        ContentType: mimeType,
      };

      const uploadCommand = new PutObjectCommand(params);
      const uploadResult = await this.s3.send(uploadCommand);
      console.log("Upload successful:", uploadResult);

      return {
        fileId: randomName,
        uploadResult,
      };
    } catch (err) {
      console.error("Error uploading object:", err);
      throw err;
    }
  }

  async getSignedUrl(key) {
    const getObjectParams = {
      Bucket: this.bucketName,
      Key: key,
    };
    const getCommand = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(this.s3, getCommand, { expiresIn: 3600 });
    return url;
  }
}

const S3ClientIns = new S3ClientClass();

module.exports = S3ClientIns;
