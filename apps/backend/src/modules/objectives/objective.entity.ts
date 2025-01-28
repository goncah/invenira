import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Objective } from '@invenira/model';
import { Document, HydratedDocument } from 'mongoose';

export type ObjectiveDocument = HydratedDocument<ObjectiveEntity>;

@Schema({ collection: 'objectives', timestamps: true })
export class ObjectiveEntity
  extends Document<string, never, Objective>
  implements Objective
{
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  iapId: string;

  @Prop({ required: true })
  formula: string;

  @Prop({ required: true })
  targetValue: number;

  @Prop({ required: true })
  value: number;

  createdAt: Date;

  @Prop({ required: true })
  createdBy: string;

  updatedAt: Date;

  @Prop({ required: true })
  updatedBy: string;
}

export const ObjectiveEntitySchema =
  SchemaFactory.createForClass(ObjectiveEntity);
