const multer = require("multer");

const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudinary = require("../Config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,

  params: async (req, file) => {
    return {
      folder: "DevTinderProfiles",

      allowed_formats: ["jpg", "png", "jpeg", "webp"],

      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
