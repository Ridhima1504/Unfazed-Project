import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Step 1: Starting Unfazed backend...");
    console.log("Step 2: Connecting to MongoDB...");

    await connectDB();

    console.log("Step 3: MongoDB connection completed.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Unfazed API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Unfazed API:", error.message);
    process.exit(1);
  }
};

startServer();
