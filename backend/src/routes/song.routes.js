const express = require("express");
const multer = require("multer");
const router = express.Router();
const uploadFile = require("../service/storage.service");
const songModel = require("../models/song.model");


const upload = multer({ storage: multer.memoryStorage() });


router.post("/songs", upload.single("audio"), async (req, res) => {

  console.log( req.body);//text-data
  console.log( req.file);//file-data
  const fileData = await uploadFile(req.file);
  console.log(fileData);

  const song = await songModel.create({
    title: req.body.title,
    artist: req.body.artist,
    audio: fileData.url,
    mood: req.body.mood
  });

  res
    .status(201)
    .json({ message: "Song uploaded successfully", song });

});

router.get("/songs", async (req,res)=>{
  const {mood} = req.query;

  const songs = await songModel.find({
    mood: mood
  });

  res.status(200).json({
    message: 'Songs Fetched Successfully',
    songs
  });
})

module.exports = router;
