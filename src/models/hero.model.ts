import mongoose, { Schema, Document } from 'mongoose';

export interface IHero extends Document {
  imageUrl: string;
  publicId: string;
  device: 'mobile' | 'desktop';
  title?: string; // slide title
  subtitle?: string; // slide subtitle
  isActive: boolean;
  createdAt: Date;
}

const HeroSchema: Schema = new Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  device: { type: String, enum: ['mobile', 'desktop'], default: 'desktop' },
  title: { type: String },
  subtitle: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Delete model in development to ensure schema changes are picked up
if (process.env.NODE_ENV === 'development' && mongoose.models.Hero) {
  delete mongoose.models.Hero;
}

const Hero = mongoose.models.Hero || mongoose.model<IHero>('Hero', HeroSchema);
export default Hero;