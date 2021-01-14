const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const Bull = require("bull");
require("dotenv").config();
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline,
} = require("@azure/storage-blob");

const DeletionQueue = new Bull("Deletion", {
  redis: {
    port: 6379,
    host: process.env.REDIS_HOST,
  },
});

const containerName1 = process.env.AZURE_STORAGE_ACCOUNT_CONTAINER_NAME;
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const getBlobName = (originalName) => {
  // Use a random number to generate a unique file name,
  // removing "0." from the start of the string.
  const identifier = Math.random().toString().replace(/0\./, "");
  return `${identifier}-${originalName}`;
};

const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY
);
const pipeline = newPipeline(sharedKeyCredential);

const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  pipeline
);

router.post("/upload", upload.single("image"), async (req, res, next) => {
  //check authentication
  try {
    if (req.user === undefined) {
      throw new Error("User not authenticated");
    }
    const { filename: image } = req.file;
    const originalFilePath = req.file.path;
    const destinationPath =
      process.env.IMG_API + "resized/" + req.file.filename;
    sharp(req.file.path)
      // .resize(850)
      .jpeg({ quality: 75 })
      .toFile(
        path.resolve(req.file.destination, "resized", image),
        async (err, info) => {
          if (err) {
            throw new Error(err);
          }
          const blobName = getBlobName(req.file.filename);
          const containerClient = blobServiceClient.getContainerClient(
            containerName1
          );
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);

          // Calculate path for uploading to azure blob storage
          let str = destinationPath;
          str = str.replace(`${process.env.IMG_API}`, "public/");
          let dir = __dirname;

          dir = dir.split(path.sep);
          dir.pop();
          dir.pop();
          dir = dir.join(path.sep);

          const finalPath = path.join(dir, str);

          //azurepath
          blockBlobClient
            .uploadFile(
              finalPath,
              uploadOptions.bufferSize,
              uploadOptions.maxBuffers,
              { blobHTTPHeaders: { blobContentType: "image/jpeg" } }
            )
            .then((_uploadRes) => {
              // console.log(uploadRes);
              //Delete local files which are resized and public directory
              DeletionQueue.add({ path: finalPath, local: true });
              DeletionQueue.add({ path: originalFilePath, local: true });

              const azureImagepath = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/images/${blobName}`;

              res.status(201).send({
                imagePath: azureImagepath,
                authenticated: true,
              });
            })
            .catch((err) => {
              res.status(400).send(err);
            });
        }
      );
  } catch (err) {
    // console.log(err);
    res.status(400).send(err);
  }
});

// Process Deletion queue
DeletionQueue.process(async (job) => {
  let filePath = job.data.path;
  let local = job.data.local;
  if (local) {
    fs.unlink(filePath, (err) => {
      if (err) {
        job.moveToFailed({ message: "job failed" });
      }
      job.moveToCompleted("done", true);
    });
  } else {
    const blobName = filePath.replace(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/images/`,
      ""
    );

    // console.log("Deleting image in azure..");

    const containerClient = blobServiceClient.getContainerClient(
      containerName1
    );
    const bb2 = containerClient.getBlockBlobClient(blobName);
    try {
      bb2.delete();
      job.moveToCompleted("done", true);
    } catch (err) {
      // console.log("Failed to delete  -> ", err);
      job.moveToFailed({ message: "job failed" });
    }
  }
});

// Add to deletion queue
router.delete("/delete", async (req, res) => {
  if (req.user === undefined) {
    return res.status(400).send({
      msg: "User Not Authenticated",
    });
  } else {
    const { path } = req.query;
    DeletionQueue.add({ path: path, local: false });
    res.status(200).send({
      msg: "Added for processing",
    });
  }
});

module.exports = { imageRouter: router, DeletionQueue };
