import { Schema } from '@nestjs/mongoose';

@Schema({ collection: 'objectives', timestamps: true })
export class Objective {}
