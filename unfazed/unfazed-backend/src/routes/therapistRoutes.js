import express from "express";
import Therapist from "../models/Therapist.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  try {
    const therapist = await Therapist.findById(
      req.therapistId
    ).select("-password_hash");

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    return res.json({ therapist });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Could not load profile",
    });
  }
});

router.put("/me", protect, async (req, res) => {
  try {
    const { name, bio, specializations, languages } = req.body;

    const therapist = await Therapist.findById(
      req.therapistId
    );

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    if (typeof name === "string" && name.trim()) {
      therapist.name = name.trim();
    }

    if (typeof bio === "string") {
      therapist.bio = bio;
    }

    if (
      Array.isArray(specializations) &&
      specializations.every((item) => typeof item === "string")
    ) {
      therapist.specializations = specializations;
    }

    if (
      Array.isArray(languages) &&
      languages.every((item) => typeof item === "string")
    ) {
      therapist.languages = languages;
    }

    await therapist.save();

    return res.json({
      message: "Profile updated",
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        bio: therapist.bio,
        specializations: therapist.specializations,
        languages: therapist.languages,
        plan: therapist.plan,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Could not update profile",
    });
  }
});

router.get("/public/:slug", async (req, res) => {
  try {
    const therapist = await Therapist.findOne({
      slug: req.params.slug.toLowerCase(),
    }).select("name slug bio specializations languages");

    if (!therapist) {
      return res.status(404).json({
        message: "Public profile not found",
      });
    }

    return res.json({ therapist });
  } catch (error) {
    console.error("Public profile error:", error);

    return res.status(500).json({
      message: "Could not load public profile",
    });
  }
});

export default router;
