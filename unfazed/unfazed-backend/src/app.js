
import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import therapistRouter from "./routes/therapistRoutes.js";

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://unfazed-project-two.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON request bodies
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Welcome to the Unfazed API",
    health: "/api/health",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Unfazed API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRouter);

// Therapist routes
app.use("/api/therapists", therapistRouter);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  const isCorsError = err.message === "Not allowed by CORS";

  res.status(isCorsError ? 403 : 500).json({
    status: "error",
    message: isCorsError
      ? "Frontend origin is not allowed by CORS"
      : "Internal server error",
  });
});

export default app;
