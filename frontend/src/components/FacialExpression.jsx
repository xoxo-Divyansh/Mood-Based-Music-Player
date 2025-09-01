import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from 'axios';


// Constants
const MODEL_URL = "/models"; // Path to face-api.js models

// Component
export default function FacialExpression({ setSongs }) {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State
  const [expression, setExpression] = useState("Waiting to Start...");
  const [cameraStatus, setCameraStatus] = useState("pending"); // 'granted', 'denied', 'pending'
  const [detectedOnce, setDetectedOnce] = useState(false); // 🔑 new flag

  // 🔧 Load face-api.js models
  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("✅ Models loaded");
    } catch (err) {
      console.error("❌ Model loading failed:", err);
      setExpression("Model loading error");
    }
  };

  // 🎥 Start webcam stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraStatus("granted");
    } catch (err) {
      console.error("🚫 Webcam access denied:", err);
      setCameraStatus("denied");
      setExpression("Camera access denied");
    }
  };

  // 🧠 Detect facial expressions
  const detectMood = async () => {
      if (detectedOnce) {
    console.log("⚠️ Already detected, skipping...");
    return; // Stop if already detected once
  }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };

    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceLandmarks(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);

      if (detections.length > 0) {
        const moods = detections[0].expressions;
        const dominantMood = Object.entries(moods).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];
        
        setExpression(dominantMood);
        setDetectedOnce(true); // Set flag to true after first detection

        console.log(dominantMood); // Log the dominant mood happy, sad, etc.

        // Use axios to fetch songs based on mood
        axios
          .get(`http://localhost:3000/songs?mood=${dominantMood}`)
          .then((response) => {
            // Agar aapko parent component ko songs bhejni hain
            if (setSongs) {
              setSongs(response.data.songs);
            }
          })
          .catch((error) => {
      console.error("❌ Error fetching songs:", error);
    });

  } else {  
    setExpression("No face detected");
    setDetectedOnce(false); // Reset flag if no face is detected
    console.log("❌ No face detected");
  }
}

  // Handle detect mood button click
const handleDetectMood = () => {
  // console.log("🔘 Detect button clicked!")
  setDetectedOnce(false); // Reset flag on button click
  detectMood();
};


  // 🚀 Initialization
  useEffect(() => {
      let intervalId;
    const init = async () => {
      const permissionStatus = await navigator
      .permissions?.query({ name: "camera" });
      setCameraStatus(permissionStatus?.state || "pending");

       videoRef.current.onloadeddata = () => {
        console.log("🎥 Video loaded");
      };
      
      if (permissionStatus?.state === "denied") {
        setExpression("Camera access denied");
        return;
      }

      await loadModels();
      await startVideo();

      videoRef.current.onloadeddata = () => {
        console.log("🎥 Video loaded");
        // detectMood()
      };
    };

    init();
      return () => clearInterval(intervalId);

  }, []);

  // 🖼️ UI
  return (
   <div className="flex flex-col items-center gap-2 p-4 min-h-1/4 bg-zinc-900">

  {/* Camera status messages */}
  {cameraStatus === "pending" && (
    <p className="text-yellow-600">🔄 Requesting camera access...</p>
  )}
  {cameraStatus === "denied" && (
    <p className="text-red-600 font-medium text-center">
      🚫 Camera access denied. Please enable it in your browser settings.
    </p>
  )}
  {cameraStatus === "granted" && (
    <p className="text-green-600">✅ Camera access granted. Detecting mood...</p>
  )}

  {/* Video + Canvas wrapper */}
  <div className="relative w-full max-w-md aspect-video border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
    <video
      ref={videoRef}
      autoPlay
      muted
      className="w-full h-full object-cover"
    />
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
    />
  </div>

  {/* Mood result */}
  <h2 className="text-xl font-semibold text-center mt-2">
    🎭 Mood: <span className="capitalize text-purple-700">{expression}</span>
  </h2>

  <button
   disabled={cameraStatus !== "granted"}
    onClick={handleDetectMood}
    className="w-max-content max-w-md bg-red-500 text-white py-2 px-2 rounded-lg shadow hover:bg-red-800 transition"
  >
    Detect Mood
  </button>

</div>

  );
};

