
import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import therapistRouter from "./routes/therapistRoutes.js";

const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

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
    routes: {
      auth: "/api/auth",
      therapists: "/api/therapists",
    },
  });
});

// Health check route
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

// Handle errors
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    status: "error",
    message:
      err.message === "Not allowed by CORS"
        ? "Frontend origin is not allowed by CORS"
        : "Internal server error",
  });
});

export default app;
