import mongoose, { Schema } from 'mongoose';
const BioTemplateSchema = new Schema({ name: { type: String, required: true, trim: true }, category: { type: String, required: true, index: true }, userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true }, themeConfig: { type: Schema.Types.Mixed, required: true }, blocks: { type: [Schema.Types.Mixed], default: [] }, isSystem: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model('BioTemplate', BioTemplateSchema);
