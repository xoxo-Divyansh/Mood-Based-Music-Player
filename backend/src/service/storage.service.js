const mongoose = require('mongoose');
const ImageKit = require("imagekit");

let imagekit = null;
let warnedMissingConfig = false;

function getImageKitClient() {
  if (imagekit) return imagekit;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true;
      console.warn(
        "ImageKit config missing. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT in backend/.env"
      );
    }
    return null;
  }

  imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return imagekit;
}

function uploadFile(file, mood = "misc") {
  const client = getImageKitClient();
  if (!client) {
    return Promise.reject(new Error("ImageKit is not configured"));
  }

  const safeMood = String(mood).toLowerCase().trim() || "misc";

  return new Promise((resolve, reject) => {
    client.upload(
      {
        file: file.buffer,
        fileName: new mongoose.Types.ObjectId().toString(),
        folder: `audio-files/${safeMood}`,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}

function listFilesByMood(mood) {
  const client = getImageKitClient();
  if (!client) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const safeMood = String(mood).toLowerCase().trim();
    const folderPath = `/audio-files/${safeMood}`;

    client.listFiles({ path: folderPath, limit: 100 }, (err, result) => {
      if (err) reject(err);
      else {
        const songs = result.map((file) => ({
          title: file.name,
          url: file.url,
        }));
        resolve(songs);
      }
    });
  });
}

module.exports = { uploadFile, listFilesByMood };
