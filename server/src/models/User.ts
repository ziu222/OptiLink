import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  tier: 'FREE' | 'PREMIUM';
  isVerified: boolean;
  timezone: string;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    tier: { type: String, enum: ['FREE', 'PREMIUM'], default: 'FREE' },
    isVerified: { type: Boolean, default: true },
    timezone: { type: String, default: 'UTC' },
    refreshTokenHash: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (this: IUser, plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    delete r.passwordHash;
    delete r.refreshTokenHash;
    delete r.__v;
    return r;
  },
});

export default mongoose.model<IUser>('User', UserSchema);
