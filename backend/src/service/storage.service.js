const mongoose = require('mongoose');
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function uploadFile(file) {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file.buffer,
      fileName: new mongoose.Types.ObjectId().toString(),
      folder: "audio-files",
    }, (err, result) => err ? reject(err) : resolve(result));
  });
}

function listFilesByMood(mood) {
  return new Promise((resolve, reject) => {
    const folderPath = `/audio-files/${mood.toLowerCase()}`;
    imagekit.listFiles({ path: folderPath, limit: 100 }, (err, result) => {
      if (err) reject(err);
      else {
        const songs = result.map(file => ({
          title: file.name,
          url: file.url
        }));
        resolve(songs);
      }
    });
  });
}

module.exports = { uploadFile, listFilesByMood };
