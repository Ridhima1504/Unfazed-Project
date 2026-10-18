import mongoose from "mongoose";

const therapistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password_hash: {
            type: String,
            required: true,
            select: false
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        bio: {
            type: String,
            default: ""
        },
        specializations: {
            type: [String],
            default: []
        },
        languages: {
            type: [String],
            default: ["English"]
        },
        plan: {
            type: String,
            enum: ["free", "bronze", "silver", "gold"],
            default: "free"
        }
    },
    {timestamps: true}
);

export default mongoose.model("Therapist", therapistSchema);