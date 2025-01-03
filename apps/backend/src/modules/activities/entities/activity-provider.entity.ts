import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ActivityProviderDocument = HydratedDocument<ActivityProvider>;

@Schema({ collection: 'activity_providers', timestamps: true })
export class ActivityProvider {
  _id: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  url: string;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const ActivityProviderSchema =
  SchemaFactory.createForClass(ActivityProvider);
