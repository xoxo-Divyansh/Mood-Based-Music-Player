require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const PORT = process.env.PORT || 3000;

// 🔥 Root health-check required for Render
app.get("/", (req, res) => {
  res.send("Backend is running properly.");
});

async function startServer() {
try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error(" DB Connection Error:", err);
  process.exit(1);
}
}

startServer();