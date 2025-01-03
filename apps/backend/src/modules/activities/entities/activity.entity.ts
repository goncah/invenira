import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ collection: 'activities', timestamps: true })
export class Activity {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityProvider',
  })
  activityProviderId: string;

  @Prop()
  parameters: Map<string, any>;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
