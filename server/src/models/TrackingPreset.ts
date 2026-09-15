import mongoose, { Schema } from 'mongoose';

const TrackingPresetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  source: { type: String, required: true, trim: true, maxlength: 100 },
  medium: { type: String, required: true, trim: true, maxlength: 100 },
  campaign: { type: String, trim: true, maxlength: 100, default: '' },
  term: { type: String, trim: true, maxlength: 100, default: '' },
  content: { type: String, trim: true, maxlength: 100, default: '' },
}, { timestamps: true });

TrackingPresetSchema.index({ userId: 1, name: 1 }, { unique: true });
export default mongoose.model('TrackingPreset', TrackingPresetSchema);
