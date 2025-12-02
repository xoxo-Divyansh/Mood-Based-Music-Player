import PropTypes from "prop-types";
import { useRef, useState } from "react";

export default function MoodSongs({ songs }) {
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(new Audio());

  // Debug: log incoming songs prop
  console.log("MoodSongs received songs:", songs);

  const handlePlay = (song) => {
    if (currentSong?._id === song._id) {
      // Agar wahi song play ho raha hai
      audioRef.current.play();
    } else {
      // Naya song
      audioRef.current.pause();
      audioRef.current.src = song.audio; // Naya src set karo
      audioRef.current.load();
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

      {!songs || songs.length === 0 ? (
        <p className="text-gray-400">No suggested songs yet.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {songs.map((song, idx) => (
            <div
              key={song._id || song.title || idx}
              className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl shadow-md hover:shadow-purple-500/40 transition-shadow duration-200"
            >
              <div className="flex flex-col w-full">
                <span className="font-medium text-white text-sm">
                  {song.title}
                </span>
                <span className="text-xs text-gray-400">{song.artist}</span>
              </div>

              <div className="flex justify-end w-full space-x-2 text-white text-lg">
                <button
                  className="ri-pause-fill cursor-pointer hover:text-purple-400"
                  onClick={handlePause}
                >
                </button>
                <button
                  className="ri-play-fill cursor-pointer hover:text-purple-400"
                  onClick={() => handlePlay(song)}
                >
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

MoodSongs.propTypes = {
  songs: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      artist: PropTypes.string,
      audio: PropTypes.string,
    })
  ),
};

MoodSongs.defaultProps = {
  songs: [],
};
