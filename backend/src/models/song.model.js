const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
   title: {
       type: String,
   },
   artist: {
       type: String,
      },
      audio: {
          type: String,
      },
      mood:{
          type: String,
      }
//    releaseDate: {
//        type: Date,
//       },
//    genre: {
//        type: String,
//       }
})


const song = mongoose.model('song', songSchema);

module.exports = song;