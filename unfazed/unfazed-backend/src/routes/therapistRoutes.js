
import express from "express";
import Therapist from "../models/Therapist.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: Load the logged-in therapist's profile.
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

    return res.status(200).json({ therapist });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Could not load profile",
    });
  }
});

// PUT: Update the logged-in therapist's profile.
router.put("/me", protect, async (req, res) => {
  try {
    const {
      name,
      bio,
      specializations,
      languages,
    } = req.body;

    const therapist = await Therapist.findById(
      req.therapistId
    );

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found",
      });
    }

    // Validate the name.
    if (typeof name === "string") {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          message: "Name cannot exceed 100 characters",
        });
      }

      therapist.name = name.trim();
    }

    // Validate the professional bio.
    if (typeof bio === "string") {
      if (bio.length > 2000) {
        return res.status(400).json({
          message: "Bio cannot exceed 2000 characters",
        });
      }

      therapist.bio = bio.trim();
    }

    // Validate specializations.
    if (specializations !== undefined) {
      if (
        !Array.isArray(specializations) ||
        !specializations.every(
          (item) => typeof item === "string"
        )
      ) {
        return res.status(400).json({
          message: "Specializations must be a list of text values",
        });
      }

      therapist.specializations = [
        ...new Set(
          specializations
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];
    }

    // Validate languages.
    if (languages !== undefined) {
      if (
        !Array.isArray(languages) ||
        !languages.every(
          (item) => typeof item === "string"
        )
      ) {
        return res.status(400).json({
          message: "Languages must be a list of text values",
        });
      }

      therapist.languages = [
        ...new Set(
          languages
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];
    }

    await therapist.save();

    // Return public-safe account details, not the password hash.
    return res.status(200).json({
      message: "Profile updated successfully",
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        bio: therapist.bio || "",
        specializations: therapist.specializations || [],
        languages: therapist.languages || [],
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

// GET: Display a therapist's public profile by slug.
router.get("/public/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.toLowerCase().trim();

    const therapist = await Therapist.findOne({
      slug,
    }).select("name slug bio specializations languages");

    if (!therapist) {
      return res.status(404).json({
        message: "Public profile not found",
      });
    }

    return res.status(200).json({ therapist });
  } catch (error) {
    console.error("Public profile error:", error);

    return res.status(500).json({
      message: "Could not load public profile",
    });
  }
});

export default router;
