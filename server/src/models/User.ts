import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  refreshTokenHashes: string[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false
    },
    refreshTokenHashes: {
      type: [String],
      default: [],
      select: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
