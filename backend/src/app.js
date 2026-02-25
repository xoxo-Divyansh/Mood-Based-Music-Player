const express = require("express");
const cors = require("cors");
const songRoutes = require("./routes/song.routes");

const app = express();

const configuredOrigins = String(process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins;

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser or same-origin requests without Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use("/", songRoutes);

module.exports = app;
