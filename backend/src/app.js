const express = require("express");
const cors = require("cors");
const songRoutes = require("./routes/song.routes");

const app = express();

app.use(express.json());
app.use(cors({
  origin: "https://your-frontend-domain.com",
  credentials: true
}));
 // Allow requests from frontend

// Health check for Render or other hosting platforms
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use("/", songRoutes);

module.exports = app;
