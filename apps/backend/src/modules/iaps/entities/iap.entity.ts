import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';
import { Iap } from '@invenira/model';

export type IapDocument = HydratedDocument<IapEntity>;

@Schema({ collection: 'iaps', timestamps: true })
export class IapEntity extends Document implements Iap {
  _id: string;

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
  activityIds: string[];

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

export const IapSchema = SchemaFactory.createForClass(IapEntity);
