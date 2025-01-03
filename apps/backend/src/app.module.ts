import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UsersModule } from './modules/users/users.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { IapsModule } from './modules/iaps/iaps.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';
import { logger } from './invenira.logger';
import { AuthModule } from './modules/auth/auth.module';
import { UtilsModule } from './modules/utils/utils.module';

@Module({
  imports: [
    UtilsModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => logger.log('connected', 'Mongoose'));
          connection.on('open', () =>
            logger.log('connection open', 'Mongoose'),
          );
          connection.on('disconnected', () =>
            logger.log('disconnected', 'Mongoose'),
          );
          connection.on('reconnected', () =>
            logger.log('reconnected', 'Mongoose'),
          );
          connection.on('disconnecting', () =>
            logger.log('disconnecting', 'Mongoose'),
          );

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ActivitiesModule,
    IapsModule,
    ObjectivesModule,
  ],
})
export class AppModule {}
