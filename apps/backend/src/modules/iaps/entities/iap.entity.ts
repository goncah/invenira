import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';

export type IapDocument = HydratedDocument<Iap>;

@Schema({ collection: 'iaps', timestamps: true })
export class Iap {
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: false })
  description: string;

  @Prop({
    required: true,
    default: [],
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Activity',
  })
  activityIds: ObjectId[];

  @Prop({ required: true, default: false })
  isDeployed: boolean;

  @Prop({ required: true, default: {} })
  deployUrls: Map<string, string>;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const IapSchema = SchemaFactory.createForClass(Iap);
