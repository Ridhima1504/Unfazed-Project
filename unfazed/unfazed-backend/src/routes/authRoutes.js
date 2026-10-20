import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Therapist from "../models/therapist";

const router = express.Router();

const makeSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Therapist.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const baseSlug = makeSlug(name) || "therapist";
    let slug = baseSlug;
    let suffix = 2;

    while (await Therapist.exists({ slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const therapist = await Therapist.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      slug,
    });

    const token = jwt.sign(
      { id: therapist._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        plan: therapist.plan,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or profile slug already exists",
      });
    }

    return res.status(500).json({
      message: "Could not create account",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    const therapist = await Therapist.findOne({ email }).select(
      "+password_hash"
    );

    if (
      !therapist ||
      !(await bcrypt.compare(password, therapist.password_hash))
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: therapist._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        plan: therapist.plan,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Could not log in",
    });
  }
});

export default router;