import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    category: {
        type: String
    },

    size: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'small'
    },

    description: {
        type: String
    },

    imageUrl: {
        type: String
    },

    publicId: {
        type: String
    }

}, { timestamps: true });

export const Gallery = mongoose.models?.Gallery || mongoose.model("Gallery", gallerySchema);
