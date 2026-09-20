import { Schema, model, Document, Types } from 'mongoose';

export type BioTheme = 'minimal-light' | 'dark-slate' | 'gradient' | 'midnight-aurora' | 'paper-studio';

export interface ISocialLink {
  platform: string;
  url: string;
  title: string;
  isEnabled: boolean;
}

export interface IBioProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  theme: BioTheme;
  socialLinks: ISocialLink[];
  showcaseLinkIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const socialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    isEnabled: { type: Boolean, default: true }
  },
  { _id: false }
);

const bioProfileSchema = new Schema<IBioProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
      trim: true
    },
    theme: {
      type: String,
      enum: ['minimal-light', 'dark-slate', 'gradient', 'midnight-aurora', 'paper-studio'],
      default: 'minimal-light'
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: []
    },
    showcaseLinkIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Link'
      }
    ]
  },
  {
    timestamps: true
  }
);

export const BioProfile = model<IBioProfile>('BioProfile', bioProfileSchema);
