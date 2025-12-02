const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadFile, listFilesByMood } = require("../service/storage.service");
const songModel = require("../models/song.model");

const upload = multer({ storage: multer.memoryStorage() });

// Upload song
router.post("/songs", upload.single("audio"), async (req, res) => {
  try {
    const fileData = await uploadFile(req.file);

    const song = await songModel.create({
      title: req.body.title,
      artist: req.body.artist,
      audio: fileData.url,
      mood: req.body.mood.toLowerCase(),
    });

    res.status(201).json({ message: "Song uploaded successfully", song });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Failed to upload song" });
  }
});

// Fetch songs by mood
router.get("/songs", async (req, res) => {
  const { mood } = req.query;
  if (!mood) return res.status(400).json({ message: "Mood query is required" });

  try {
    console.log(`GET /songs - mood query received: "${mood}"`);

    let songs = await songModel.find({ mood: mood.toLowerCase() });
    console.log(
      `DB returned ${songs.length} song(s) for mood='${mood.toLowerCase()}'`
    );

    if (!songs.length) {
      const fallback = await listFilesByMood(mood);
      console.log(
        `ImageKit fallback returned ${
          fallback.length
        } file(s) for mood='${mood.toLowerCase()}'`
      );
      songs = fallback;
    }

    console.log(
      "Final songs payload length:",
      Array.isArray(songs) ? songs.length : 0
    );
    if (Array.isArray(songs) && songs.length > 0)
      console.log("Sample song[0]:", songs[0]);

    res.status(200).json({
      message: "Songs fetched successfully",
      songs,
    });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch songs", songs: [] });
  }
});

module.exports = router;
