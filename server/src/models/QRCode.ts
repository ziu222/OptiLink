import mongoose, { Document, Schema } from 'mongoose';

export interface IQRConfig {
  fgColor: string;
  bgColor: string;
  logoUrl?: string | null;
  eyeType: 'square' | 'rounded' | 'dot';
  dotType: 'square' | 'rounded' | 'dots';
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface IQRCode extends Document {
  userId: mongoose.Types.ObjectId;
  linkId?: mongoose.Types.ObjectId | null;
  title: string;
  targetUrl: string;
  config: IQRConfig;
  previewUrl?: string;
  scansCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QRConfigSchema = new Schema<IQRConfig>(
  {
    fgColor: { type: String, default: '#000000' },
    bgColor: { type: String, default: '#ffffff' },
    logoUrl: { type: String, default: null },
    eyeType: {
      type: String,
      enum: ['square', 'rounded', 'dot'],
      default: 'square',
    },
    dotType: {
      type: String,
      enum: ['square', 'rounded', 'dots'],
      default: 'square',
    },
    size: { type: Number, default: 512, min: 128, max: 4096 },
    errorCorrectionLevel: {
      type: String,
      enum: ['L', 'M', 'Q', 'H'],
      default: 'M',
    },
  },
  { _id: false }
);

const QRCodeSchema = new Schema<IQRCode>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    linkId: { type: Schema.Types.ObjectId, ref: 'Link', default: null, index: true },
    title: { type: String, default: 'My QR Code', trim: true, maxlength: 120 },
    targetUrl: { type: String, required: true, trim: true },
    config: { type: QRConfigSchema, default: () => ({}) },
    previewUrl: { type: String, default: '' },
    scansCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

QRCodeSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IQRCode>('QRCode', QRCodeSchema);
