import { Schema, model, Document, Types } from 'mongoose';

export type DeviceType = 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown';

export interface IClickEvent extends Document {
  _id: Types.ObjectId;
  linkId: Types.ObjectId;
  timestamp: Date;
  referrer: string;
  deviceType: DeviceType;
  ipHash: string;
}

const clickEventSchema = new Schema<IClickEvent>(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: 'Link',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    referrer: {
      type: String,
      default: 'Direct',
      trim: true
    },
    deviceType: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown'],
      default: 'Unknown'
    },
    ipHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false
  }
);

// Compound indexes for analytics queries
clickEventSchema.index({ linkId: 1, timestamp: -1 });
clickEventSchema.index({ linkId: 1, deviceType: 1 });
clickEventSchema.index({ linkId: 1, referrer: 1 });

export const ClickEvent = model<IClickEvent>('ClickEvent', clickEventSchema);
