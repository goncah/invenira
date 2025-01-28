import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Activity } from '@invenira/model';

export type ActivityDocument = HydratedDocument<ActivityEntity>;

@Schema({ collection: 'activities', timestamps: true })
export class ActivityEntity
  extends Document<string, never, Activity>
  implements Activity
{
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityProvider',
  })
  activityProviderId: string;

  @Prop({ required: true, type: Map, default: {} })
  parameters: { [k: string]: unknown };

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const ActivitySchema = SchemaFactory.createForClass(ActivityEntity);
