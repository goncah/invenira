import { Module } from '@nestjs/common';
import { IapsService } from './iaps.service';
import { IapsController } from './iaps.controller';
import { ActivitiesModule } from '../activities/activities.module';
import { MongooseModule } from '@nestjs/mongoose';
import { logger } from '../../invenira.logger';
import { IapEntity, IapSchema } from './iap.entity';

@Module({
  imports: [
    ActivitiesModule,
    MongooseModule.forFeatureAsync([
      {
        name: IapEntity.name,
        useFactory: () => {
          const schema = IapSchema;

          schema.post('save', (next: any) => {
            logger.debug(`Saving IAP ${JSON.stringify(next._doc)}`, 'Mongoose');
          });

          return schema;
        },
      },
    ]),
  ],
  controllers: [IapsController],
  providers: [IapsService],
  exports: [IapsService],
})
export class IapsModule {}
