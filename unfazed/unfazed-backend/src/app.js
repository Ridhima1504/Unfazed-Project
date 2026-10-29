
import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import therapistRouter from "./routes/therapistRoutes.js";

const app = express();

// Frontend URLs permitted to access the backend.
const allowedOrigins = [
  "http://localhost:5173",
  "https://unfazed-project-two.vercel.app",
  "https://unfazed-project-gold.vercel.app",
  "https://unfazed-project-3x36dsdhc-ridhima1504s-projects.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Allow known production and preview deployments for this project.
// Do not allow arbitrary websites.
function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^https:\/\/unfazed-project(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(
    origin
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// API root
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Welcome to the Unfazed API",
    health: "/api/health",
  });
});

// Backend health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Unfazed API is running",
  });
});

// Authentication
app.use("/api/auth", authRouter);

// Therapist profiles
app.use("/api/therapists", therapistRouter);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "Frontend origin is not allowed by CORS",
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON request body",
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export default app;
