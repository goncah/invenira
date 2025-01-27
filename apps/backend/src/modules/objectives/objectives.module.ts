import { Module } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { ObjectivesController } from './objectives.controller';
import { ObjectiveEntity, ObjectiveEntitySchema } from './objective.entity';
import { logger } from '../../invenira.logger';
import { MongooseModule } from '@nestjs/mongoose';
import { IapsModule } from '../iaps/iaps.module';

@Module({
  imports: [
    IapsModule,
    MongooseModule.forFeatureAsync([
      {
        name: ObjectiveEntity.name,
        useFactory: () => {
          const schema = ObjectiveEntitySchema;

          schema.post('save', (next: any) => {
            logger.debug(
              `Saving Objective ${JSON.stringify(next._doc)}`,
              'Mongoose',
            );
          });

          return schema;
        },
      },
    ]),
  ],
  controllers: [ObjectivesController],
  providers: [ObjectivesService],
})
export class ObjectivesModule {}
