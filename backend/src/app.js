const express = require("express");
const cors = require("cors");
const songRoutes = require("./routes/song.routes");

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true
}));

// Your APIs
app.use("/", songRoutes);

module.exports = app;
