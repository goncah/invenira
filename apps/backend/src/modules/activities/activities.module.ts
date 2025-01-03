import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from './entities/activity.entity';
import { logger } from '../../invenira.logger';
import { ActivityProvidersController } from './activity-providers.controller';
import { ActivityProvidersClient } from './activity-providers.client';
import {
  ActivityProvider,
  ActivityProviderSchema,
} from './entities/activity-provider.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('APC_HTTP_TIMEOUT'),
        maxRedirects: configService.get<number>('APC_HTTP_MAX_REDIRECTS'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeatureAsync([
      {
        name: Activity.name,
        useFactory: () => {
          const schema = ActivitySchema;

          schema.post('save', (next: any) => {
            logger.debug(
              `Saving Activity ${JSON.stringify(next._doc)}`,
              'Mongoose',
            );
          });

          return schema;
        },
      },
    ]),
    MongooseModule.forFeatureAsync([
      {
        name: ActivityProvider.name,
        useFactory: () => {
          const schema = ActivityProviderSchema;

          schema.post('save', (next: any) => {
            logger.debug(
              `Saving Activity Provider${JSON.stringify(next._doc)}`,
              'Mongoose',
            );
          });

          return schema;
        },
      },
    ]),
  ],
  controllers: [ActivitiesController, ActivityProvidersController],
  providers: [ActivitiesService, ActivityProvidersClient],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
