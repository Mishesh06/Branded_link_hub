import { Schema, model, Document, Types } from 'mongoose';

export interface ILink extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  originalUrl: string;
  shortCode: string;
  isCustomSlug: boolean;
  clickCount: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    isCustomSlug: {
      type: Boolean,
      default: false
    },
    clickCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast paginated listing per user
linkSchema.index({ userId: 1, createdAt: -1 });
linkSchema.index({ userId: 1, status: 1 });

export const Link = model<ILink>('Link', linkSchema);
