import axios from "axios";
import * as faceapi from "face-api.js";
import { useCallback, useEffect, useRef, useState } from "react";

// Constants
const MODEL_URL = "/models"; // Path to face-api.js models
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Component
export default function FacialExpression({ setSongs }) {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State
  const [expression, setExpression] = useState("Waiting to Start...");
  const [cameraStatus, setCameraStatus] = useState("pending"); // 'granted', 'denied', 'pending'
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  // RAF refs and throttle
  const rafIdRef = useRef(null);
  const lastRunRef = useRef(0);
  const THROTTLE_MS = 300; // run at most once per 300ms (adjust as needed)

  // 🔧 Load face-api.js models
  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      console.log("✅ Models loaded");
      setModelsLoaded(true);
    } catch (err) {
      console.error("❌ Model loading failed:", err);
      setExpression("Model loading error");
    }
  };

  // 🎥 Start webcam stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      videoRef.current.srcObject = stream;
      setCameraStatus("granted");
      console.log("🎥 Camera access granted");
    } catch (err) {
      console.error("CAMERA ERROR:", err.name, err.message);
      setCameraStatus("denied");
      setExpression("Camera error: " + err.name);
    }
  };

  // 🧠 Detect facial expressions
  const detectMood = useCallback(async () => {
    if (!modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || video.clientWidth;
    const h = video.videoHeight || video.clientHeight;
    if (!w || !h) return;

    const displaySize = { width: w, height: h };
    faceapi.matchDimensions(canvas, displaySize);

    let detections = [];
    try {
      detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
    } catch (err) {
      console.error("Detection error:", err);
      return;
    }

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

      if (expression !== dominantMood) {
        setExpression(dominantMood);
        console.log("Detected mood:", dominantMood);

        // Fetch songs from backend dynamically
        console.log("Requesting songs for mood:", dominantMood);
        axios
          .get(`${API_URL}/songs?mood=${dominantMood}`)
          .then((response) => {
            console.log("Songs response:", response?.data);
            const raw =
              (response && response.data && response.data.songs) || [];
            // Normalize different backend formats (DB documents vs ImageKit fallback)
            const normalized = raw.map((s, idx) => ({
              _id: s._id || s.url || s.title || idx,
              title: s.title || s.name || s.fileName || `Track ${idx + 1}`,
              artist: s.artist || s.artistName || "",
              audio: s.audio || s.url || s.fileUrl || "",
            }));
            if (setSongs) setSongs(normalized);
          })
          .catch((error) => {
            console.error("Error fetching songs:", error);
            if (setSongs) setSongs([]);
          });
      }

      // Stop automatic detection after first detection
      if (detectionEnabled) {
        setDetectionEnabled(false);
        console.log("Automatic detection stopped after first result");
      }
    } else {
      setExpression("No face detected");
    }
  }, [modelsLoaded, expression, setSongs, detectionEnabled]);

  // Toggle detection on button click
  const handleDetectMood = () => {
    if (!detectionEnabled) {
      setDetectionEnabled(true);
      detectMood(); // Immediate detection
    } else {
      setDetectionEnabled(false);
    }
  };

  // Start detection loop using requestAnimationFrame with optional throttle
  useEffect(() => {
    let mounted = true;

    const loop = async () => {
      if (!mounted) return;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      if (now - lastRunRef.current >= THROTTLE_MS) {
        lastRunRef.current = now;
        await detectMood();
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };

    if (cameraStatus === "granted" && modelsLoaded && detectionEnabled) {
      lastRunRef.current = 0;
      rafIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      mounted = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    };
  }, [cameraStatus, modelsLoaded, detectMood, detectionEnabled]);

  // Load models and camera on mount
  useEffect(() => {
    const currentVideo = videoRef.current;
    loadModels().then(startVideo).catch(console.error);
    return () => {
      if (currentVideo && currentVideo.srcObject) {
        const tracks = currentVideo.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 p-4 min-h-1/4 bg-zinc-900">
      {/* Status */}
      {cameraStatus === "pending" && (
        <p className="text-yellow-600">🔄 Requesting camera access...</p>
      )}
      {cameraStatus === "denied" && (
        <p className="text-red-600 font-medium text-center">
          🚫 Camera access denied. Please enable it in your browser.
        </p>
      )}
      {cameraStatus === "granted" && (
        <p className="text-green-600">
          ✅ Camera access granted. Detecting mood...
        </p>
      )}

      {/* Video + Canvas */}
      <div className="relative w-full max-w-md aspect-video border-2 border-gray-300 rounded-lg overflow-hidden shadow-md">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            const v = videoRef.current;
            const c = canvasRef.current;
            if (v && c) {
              c.width = v.videoWidth;
              c.height = v.videoHeight;
            }
            }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      {/* Mood display */}
      <h2 className="text-xl font-semibold text-center mt-2">
        🎭 Mood:{" "}
        <span className="capitalize text-purple-700">{expression}</span>
      </h2>

      <button
        disabled={cameraStatus !== "granted" || !modelsLoaded}
        onClick={handleDetectMood}
        className={`w-max-content max-w-md py-2 px-4 rounded-lg shadow font-semibold transition ${
          detectionEnabled
            ? "bg-red-600 hover:bg-red-800 text-white"
            : "bg-rose-500 hover:bg-rose-600 text-white"
        }`}
      >
        {detectionEnabled ? "Stop Detection" : "Start Detection"}
      </button>
    </div>
  );
}
