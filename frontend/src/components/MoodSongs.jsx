import { useRef, useState } from "react";

export default function MoodSongs({ songs }) {
  console.log(songs);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(new Audio());

  const handlePlay = (song) => {
    if (currentSong?.audio === song.audio) {
      // Agar wahi song dobara play ho raha hai
      audioRef.current.play();
    } else {
      // Naya song play karo
      audioRef.current.pause();
      audioRef.current = new Audio(song.audio);
      audioRef.current.play();
      setCurrentSong(song);
    }
  };

  const handlePause = () => {
    audioRef.current.pause();
  };

  return (
    <div className="w-full max-w-screen min-h-screen bg-zinc-900 p-6">
      <h3 className="text-xl font-semibold mb-4 text-purple-400">
        🎵 Suggested songs:
      </h3>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {songs.map((song, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl shadow-md hover:shadow-purple-500/40 transition-shadow duration-200"
          >
            <div className="flex flex-col w-full">
              <span className="font-medium text-white text-sm">
                {song.title}
              </span>
              <span className="text-xs text-gray-400">{song.artist}</span>
            </div>

            {/* Play / Pause Buttons */}
            <div className="flex justify-end w-full space-x-2 text-white text-lg">
              <i
                className="ri-pause-fill cursor-pointer hover:text-purple-400"
                onClick={handlePause}
              ></i>
              <i
                className="ri-play-fill cursor-pointer hover:text-purple-400"
                onClick={() => handlePlay(song)}
              ></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
