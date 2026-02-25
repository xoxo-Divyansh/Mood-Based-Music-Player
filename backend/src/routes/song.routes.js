const express = require("express");
const multer = require("multer");
const router = express.Router();
const { uploadFile, listFilesByMood } = require("../service/storage.service");
const songModel = require("../models/song.model");

const upload = multer({ storage: multer.memoryStorage() });

const MOOD_MAP = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  neutral: "neutral",
  surprised: "happy",
  surprise: "happy",
  fearful: "sad",
  fear: "sad",
  disgusted: "angry",
  disgust: "angry",
};

const normalizeMood = (mood) => {
  const key = String(mood || "").toLowerCase().trim();
  return MOOD_MAP[key] || key;
};

// Upload song
router.post("/songs", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    if (!req.body?.mood) {
      return res.status(400).json({ message: "Mood is required" });
    }

    const normalizedMood = normalizeMood(req.body.mood);
    const fileData = await uploadFile(req.file, normalizedMood);

    const song = await songModel.create({
      title: req.body.title,
      artist: req.body.artist,
      audio: fileData.url,
      mood: normalizedMood,
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
    const normalizedMood = normalizeMood(mood);
    console.log(
      `GET /songs - mood query received: "${mood}", resolved to "${normalizedMood}"`
    );

    let songs = await songModel.find({ mood: normalizedMood });
    console.log(
      `DB returned ${songs.length} song(s) for mood='${normalizedMood}'`
    );

    if (!songs.length) {
      const fallback = await listFilesByMood(normalizedMood);
      console.log(
        `ImageKit fallback returned ${
          fallback.length
        } file(s) for mood='${normalizedMood}'`
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
      requestedMood: String(mood).toLowerCase(),
      resolvedMood: normalizedMood,
    });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch songs", songs: [] });
  }
});

module.exports = router;
