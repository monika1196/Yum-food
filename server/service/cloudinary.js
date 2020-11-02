const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../../config");
const {
  Storage: { PRODUCT },
  CustomException,
  Logger,
} = require("../utils");

const log = new Logger("Service:cloudinary");

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: PRODUCT,
    transformation: [{ width: 100, height: 100, crop: "limit" }],
  },
});

const upload = multer({
  storage,

  // file limit is 1mb
  limits: { fileSize: 1024 * 1024 },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(gif|jpe?g|png)$/i)) {
      return cb(new CustomException("file must be an image"));
    }
    return cb(null, true);
  },
});

const deleteFile = async (params) => {
  try {
    return await cloudinary.uploader.destroy(params, (error, result) => {
      if (error) return log.info("File Found in S3");
      return log.info(`File deleted succesfully ${JSON.stringify(result)}`);
    });
  } catch (err) {
    return log.info(`ERROR in file Deleting : ${JSON.stringify(err)}`);
  }
};

module.exports = {
  upload,
  deleteFile,
};