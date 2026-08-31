import mongoose, { Document, Schema } from 'mongoose';

export interface ILink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  slug: string;
  shortUrl: string;
  clicks: number;
  isActive: boolean;
  title: string;
  redirectMode: 'standard' | 'splash';
  expiresAt: Date | null;
  passwordHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalUrl: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  shortUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  title: { type: String, default: '' },
  redirectMode: { type: String, enum: ['standard', 'splash'], default: 'standard' },
  expiresAt: { type: Date, default: null },
  passwordHash: { type: String, default: null, select: false }
}, {
  timestamps: true
});

LinkSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ILink>('Link', LinkSchema);
