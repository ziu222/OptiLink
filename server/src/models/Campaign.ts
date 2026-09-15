import mongoose, { Document, Schema } from 'mongoose';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'expired';
export type CampaignRuleType = 'device' | 'country' | 'language' | 'time';

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: CampaignStatus;
  linkIds: mongoose.Types.ObjectId[];
  entryLinkId: mongoose.Types.ObjectId;
  defaultLinkId: mongoose.Types.ObjectId;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaignRuleCondition {
  type: CampaignRuleType;
  values?: string[];
  startMinute?: number;
  endMinute?: number;
  timezone?: string;
}

export interface ICampaignRule extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  condition: ICampaignRuleCondition;
  targetLinkId: mongoose.Types.ObjectId;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'expired'],
      default: 'draft',
      index: true,
    },
    linkIds: [{ type: Schema.Types.ObjectId, ref: 'Link', required: true }],
    entryLinkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true, unique: true },
    defaultLinkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
  },
  { timestamps: true },
);

CampaignSchema.index({ userId: 1, createdAt: -1 });
CampaignSchema.index({ userId: 1, status: 1 });

const CampaignRuleConditionSchema = new Schema<ICampaignRuleCondition>(
  {
    type: { type: String, enum: ['device', 'country', 'language', 'time'], required: true },
    values: [{ type: String, trim: true }],
    startMinute: { type: Number, min: 0, max: 1439 },
    endMinute: { type: Number, min: 0, max: 1439 },
    timezone: { type: String, trim: true, maxlength: 64 },
  },
  { _id: false },
);

const CampaignRuleSchema = new Schema<ICampaignRule>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    condition: { type: CampaignRuleConditionSchema, required: true },
    targetLinkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    priority: { type: Number, required: true, min: 1, max: 1000 },
  },
  { timestamps: true },
);

CampaignRuleSchema.index({ campaignId: 1, priority: 1 });

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
export const CampaignRule = mongoose.model<ICampaignRule>('CampaignRule', CampaignRuleSchema);
