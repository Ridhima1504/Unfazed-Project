import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import TherapistRouter from "./routes/therapistRoutes.js";

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "https://localhost:5173"
    })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Unfazed API is running"});
});

app.use("/api/auth", authRouter);
app.use("/api/therapists", TherapistRouter);

export default app;