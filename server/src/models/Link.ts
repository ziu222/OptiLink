import mongoose, { Document, Schema } from 'mongoose';

export interface ILink extends Document {
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  slug: string;
  shortUrl: string;
  clicks: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalUrl: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  shortUrl: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<ILink>('Link', LinkSchema);
