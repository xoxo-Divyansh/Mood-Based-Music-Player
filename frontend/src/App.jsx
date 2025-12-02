import { useState } from "react";
import FacialExpression from './components/FacialExpression';
import MoodSongs from './components/MoodSongs';
import './App.css';

function App() {
  const [Songs, setSongs] = useState([]);

  return (
    <div className="h-screen">
      {/* Facial Expression Detector → yaha se setSongs pass kar rahe hain */}
      <FacialExpression setSongs={setSongs} />

      {/* Songs list display */}
      <MoodSongs songs={Songs} />
    </div>
  );
}

export default App;
