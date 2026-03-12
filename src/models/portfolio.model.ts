import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
    name: String,
    bio: String,
    experienceYears: Number,
    instagram: String,
    facebook: String,
    profileImage: String,
    publicId: String // Added for Cloudinary management
}, { timestamps: true });

export const Portfolio = mongoose.models?.Portfolio || mongoose.model("Portfolio", portfolioSchema);