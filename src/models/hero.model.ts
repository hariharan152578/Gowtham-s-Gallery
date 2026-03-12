import mongoose, { Schema, Document } from 'mongoose';

export interface IHero extends Document {
  imageUrl: string;
  publicId: string; // Added for Cloudinary deletion
  isActive: boolean;
  createdAt: Date;
}

const HeroSchema: Schema = new Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Hero = mongoose.models.Hero || mongoose.model<IHero>('Hero', HeroSchema);
export default Hero;