const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.S3ApiKey,
  secretAccessKey: process.env.S3Secret,
  region: process.env.S3Region,
});

const corsParams = {
  Bucket: process.env.S3BucketName,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ["http://localhost", "*"], // Allow all domains to be accessed
        AllowedHeaders: ["*"], // Allow all headers to be accessed
        AllowedMethods: ["*"], // Allow all methods to be accessed
        MaxAgeSeconds: 3000, // Time interval
      },
    ],
  },
};

s3.putBucketCors(corsParams, function (err, data) {
  if (err) {
    console.log("Error setting CORS configuration: ", err);
  } else {
    console.log("CORS configuration set successfully: ", data);
  }
});

module.exports = s3;
