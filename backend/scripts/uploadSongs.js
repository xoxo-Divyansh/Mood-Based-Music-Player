require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('../src/models/song.model'); // adjust path if needed

async function uploadSongs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const songs = [
      // Happy
      { title: 'Happy Song 1', mood: 'happy', url: 'https://ik.imagekit.io/audio-files/happy_song/happy_song1.mp3' },
      { title: 'Happy Song 2', mood: 'happy', url: 'https://ik.imagekit.io/audio-files/happy_song/happy_song2.mp3' },
      { title: 'Happy Song 3', mood: 'happy', url: 'https://ik.imagekit.io/audio-files/happy_song/happy_song3.mp3' },

      // Sad
      { title: 'Sad Song 1', mood: 'sad', url: 'https://ik.imagekit.io/audio-files/sad_song/sad_song1.mp3' },
      { title: 'Sad Song 2', mood: 'sad', url: 'https://ik.imagekit.io/audio-files/sad_song/sad_song2.mp3' },
      { title: 'Sad Song 3', mood: 'sad', url: 'https://ik.imagekit.io/audio-files/sad_song/sad_song3.mp3' },

      // Angry
      { title: 'Angry Song 1', mood: 'angry', url: 'https://ik.imagekit.io/audio-files/angry_song/angry_song1.mp3' },
      { title: 'Angry Song 2', mood: 'angry', url: 'https://ik.imagekit.io/audio-files/angry_song/angry_song2.mp3' },
      { title: 'Angry Song 3', mood: 'angry', url: 'https://ik.imagekit.io/audio-files/angry_song/angry_song3.mp3' },

      // Neutral
      { title: 'Neutral Song 1', mood: 'neutral', url: 'https://ik.imagekit.io/audio-files/neutral_song/neutral_song1.mp3' },
      { title: 'Neutral Song 2', mood: 'neutral', url: 'https://ik.imagekit.io/audio-files/neutral_song/neutral_song2.mp3' },
      { title: 'Neutral Song 3', mood: 'neutral', url: 'https://ik.imagekit.io/audio-files/neutral_song/neutral_song3.mp3' },

      // You can add fearful, disgusted, surprised if you want
    ];

    for (let song of songs) {
      await Song.create(song);
      console.log(`Uploaded: ${song.title}`);
    }

    console.log('✅ All songs uploaded successfully!');
  } catch (err) {
    console.error('❌ Error uploading songs:', err);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the upload
uploadSongs();
