import { useState } from "react";
import FacialExpression from './components/FacialExpression';
import MoodSongs from './components/MoodSongs';
import './App.css';

function App() {
  const [Songs, setSongs] = useState([
        // {
        //   title: "Song 1",
        //   artist: "Artist 1",
        //   mood: "happy",
        //   url: "https://example.com/song1",
        // },
        // {
        //   title: "Song 2",
        //   artist: "Artist 2",
        //   mood: "sad",
        //   url: "https://example.com/song2",
        // },
  ]);

  return (
    <div>
      {/* Facial Expression Detector → yaha se setSongs pass kar rahe hain */}
      <FacialExpression setSongs={setSongs} />

      {/* Songs list display */}
      <MoodSongs songs={Songs} />
    </div>
  );
}

export default App;
