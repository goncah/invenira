import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ActivityProvider } from '@invenira/model';

export type ActivityProviderDocument = HydratedDocument<ActivityProviderEntity>;

@Schema({ collection: 'activity_providers', timestamps: true })
export class ActivityProviderEntity
  extends Document
  implements ActivityProvider
{
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

export const ActivityProviderSchema = SchemaFactory.createForClass(
  ActivityProviderEntity,
);
