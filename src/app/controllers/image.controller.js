const { errorCustom, errorInternalServer } = require("../views/error");
const { uploadToS3, isImage, getImageInfo } = require("../utils/image.helper");
const imageStore = require("../storages/image.store");
const { simpleSuccessResponse } = require("../views/response_to_client");

class ImageController {
  // [POST] /upload_img

  uploadImage = async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).send(errorCustom(400, "Uploaded file not found!"));
      }

      const buffer = req.file.buffer;
      const url = "imgs/" + Date.now() + "-" + req.file.originalname;

      if (!isImage(buffer)) {
        return res
          .status(400)
          .send(errorCustom(400, "Uploaded file must be an image!"));
      }

      var imageInfo = getImageInfo(buffer, url);

      // Upload file to AWS S3
      let check = await uploadToS3(imageInfo, buffer);
      if (check) {
        // return image information to Client
        imageInfo.url = process.env.S3Domain + "/" + imageInfo.url;
        imageInfo.created_by = req.user.userId;

        imageStore.create(imageInfo);
        res
          .status(200)
          .send(simpleSuccessResponse(imageInfo, "Successfully uploaded!"));
      } else {
        res
          .status(500)
          .send(errorInternalServer("Something went wrong when upload image!"));
      }
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server!"));
    }
  };
}

module.exports = new ImageController();
