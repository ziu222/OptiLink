import mongoose, { Schema } from 'mongoose';
const LinkHealthCheckSchema = new Schema({
  linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
  status: { type: String, enum: ['healthy', 'warning', 'critical'], required: true },
  statusCode: { type: Number, default: null },
  responseMs: { type: Number, default: null },
  error: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } });
LinkHealthCheckSchema.index({ linkId: 1, createdAt: -1 });
export default mongoose.model('LinkHealthCheck', LinkHealthCheckSchema);
