const imageSize = require("image-size");
const s3 = require("../../configs/awss3/s3");

function isImage(buffer) {
  try {
    imageSize(buffer);
    return true;
  } catch (err) {
    return false;
  }
}

function getImageInfo(buffer, url) {
  const dimensions = imageSize(buffer);
  const extension = url.match(/\.(\w+)$/);
  return {
    width: dimensions.width,
    height: dimensions.height,
    url: url,
    cloud_name: "s3",
    extension: extension[1],
  };
}

async function uploadToS3(imageInfo, buffer) {
  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket: process.env.S3BucketName,
        Key: imageInfo.url,
        Body: buffer,
        ACL: "public-read",
      },
      (err, result) => {
        if (err) {
          // If there's an error during upload, reject the promise with the error
          reject(err);
        } else {
          // If upload is successful, resolve the promise with the result
          resolve(result);
        }
      }
    );
  });
}

module.exports = { isImage, getImageInfo, uploadToS3};
