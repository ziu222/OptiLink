import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  linkId: mongoose.Types.ObjectId; // Trỏ về Link
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  referrer: string;
  country: string;
  city: string;
  source: 'direct' | 'qr'; // Truy cập qua link rút gọn hay quét mã QR
  createdAt: Date;
}

const AnalyticsSchema = new Schema({
  linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
  ipAddress: { type: String, default: 'unknown' },
  userAgent: { type: String, default: 'unknown' },
  deviceType: { 
    type: String, 
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  referrer: { type: String, default: '' },
  country: { type: String, default: 'unknown' },
  city: { type: String, default: 'unknown' },
  source: {
    type: String,
    enum: ['direct', 'qr'],
    default: 'direct'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // Chỉ cần track thời gian click
});

// Covers the rolling-window click aggregation (match by linkId + createdAt range).
AnalyticsSchema.index({ linkId: 1, createdAt: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
