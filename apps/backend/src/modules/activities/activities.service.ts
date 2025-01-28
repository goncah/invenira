import { Injectable } from '@nestjs/common';
import { ActivityEntity } from './activity.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '../../exceptions/bad.request.exception';
import { ActivityProviderEntity } from './activity-provider.entity';
import { ActivityProvidersClient } from './activity-providers.client';
import { EventBusService } from '../utils/event-bus-service';
import {
  Activity,
  ActivityProvider,
  AnalyticsContract,
  ConfigInterface,
  CreateActivity,
  CreateActivityProvider,
  UpdateActivity,
  UpdateActivityProvider,
} from '@invenira/model';
import { AxiosInstance } from 'axios';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';

@Injectable()
export class ActivitiesService {
  private readonly axios: AxiosInstance;

  constructor(
    @InjectModel(ActivityEntity.name)
    private activityModel: Model<ActivityEntity>,
    @InjectModel(ActivityProviderEntity.name)
    private readonly activityProviderModel: Model<ActivityProviderEntity>,
    private readonly activityProvidersClient: ActivityProvidersClient,
    private eventBus: EventBusService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
  ) {
    this.axios = this.httpService.axiosRef as AxiosInstance; // required for ncc
  }

  async createActivity(createActivityDto: CreateActivity): Promise<Activity> {
    const par = await this.getActivityParameters(
      createActivityDto.activityProviderId,
    );

    if (!par.every((e) => e in createActivityDto.parameters)) {
      throw new BadRequestException('Missing parameters');
    }

    return await this.activityModel.create(createActivityDto);
  }

  async findAllActivities(): Promise<Activity[]> {
    return await this.activityModel.find().exec();
  }

  async findOneActivity(id: string): Promise<Activity> {
    return await this.activityModel.findOne({ _id: id }).exec();
  }

  async findOneActivityMetrics(id: string): Promise<AnalyticsContract> {
    const activity = await this.findOneActivity(id);

    if (!activity) {
      throw new BadRequestException(`Activity ${id} not found.`);
    }

    const ap = await this.findOneActivityProvider(activity.activityProviderId);

    return await this.activityProvidersClient.getAnalyticsContract(ap.url);
  }

  async updateActivity(
    id: string,
    updateActivityDto: UpdateActivity,
  ): Promise<Activity> {
    const par = await this.getActivityParameters(id);

    if (!par.every((e) => e in updateActivityDto.parameters)) {
      throw new BadRequestException('Missing parameters');
    }

    return await this.activityModel
      .findByIdAndUpdate({ _id: id }, updateActivityDto, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  async removeActivity(id: string): Promise<Activity> {
    const used = await this.eventBus.emitAsync('iap.uses.activity', id);

    if (used[0].used) {
      throw new BadRequestException('Activity in use by IAP!');
    }

    return await this.activityModel.findByIdAndDelete({ _id: id }).exec();
  }

  async getActivitiesCountForProvider(providerId: string): Promise<number> {
    return this.activityModel.countDocuments({
      activityProviderId: providerId,
    });
  }

  async createActivityProvider(
    createActivityProviderDto: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    if (createActivityProviderDto.url.endsWith('/')) {
      createActivityProviderDto.url = createActivityProviderDto.url.substring(
        0,
        createActivityProviderDto.url.length - 1,
      );
    }

    await this.activityProvidersClient.getActivityParameters(
      createActivityProviderDto.url,
    );

    return await this.activityProviderModel.create(createActivityProviderDto);
  }

  async findAllActivityProviders(): Promise<ActivityProvider[]> {
    return await this.activityProviderModel.find().exec();
  }

  async findOneActivityProvider(id: string): Promise<ActivityProvider> {
    return await this.activityProviderModel.findOne({ _id: id }).exec();
  }

  async getConfigurationInterfaceUrl(id: string): Promise<ConfigInterface> {
    const ap = await this.findOneActivityProvider(id);
    const url = await this.activityProvidersClient.getConfigInterface(ap.url);

    return { url };
  }

  async updateActivityProvider(
    id: string,
    updateActivityProviderDto: UpdateActivityProvider,
  ): Promise<ActivityProvider> {
    if (updateActivityProviderDto.url.endsWith('/')) {
      updateActivityProviderDto.url = updateActivityProviderDto.url.substring(
        0,
        updateActivityProviderDto.url.length - 1,
      );
    }

    await this.activityProvidersClient.getActivityParameters(
      updateActivityProviderDto.url,
    );

    return await this.activityProviderModel
      .findByIdAndUpdate({ _id: id }, updateActivityProviderDto, { new: true })
      .exec();
  }

  async removeActivityProvider(id: string): Promise<void> {
    return this.getActivitiesCountForProvider(id).then((count) => {
      if (count > 0) {
        throw new BadRequestException(
          'Activities for the Activity Provider exists!',
        );
      } else {
        this.activityProviderModel.findByIdAndDelete({ _id: id }).exec();
      }
    });
  }

  async getActivityParameters(id: string): Promise<string[]> {
    const apUrl = await this.findOneActivityProvider(id).then((ap) => ap.url);

    return this.activityProvidersClient.getActivityParameters(apUrl);
  }

  async deploy(activityId: string): Promise<string> {
    const activity = await this.findOneActivity(activityId);
    const ap = await this.findOneActivityProvider(activity.activityProviderId);
    return this.activityProvidersClient.deployActivity(ap.url, activityId);
  }

  async provide(
    activityId: string,
    userId: string,
    data: any,
  ): Promise<string> {
    if (!activityId || !userId || !data) {
      throw new BadRequestException('Invalid Request!');
    }

    const activity = await this.findOneActivity(activityId);

    if (!activity) {
      throw new BadRequestException('Invalid Activity!');
    }

    let activityUrl: string;

    try {
      activityUrl = JSON.parse(atob(data)).activityUrl;
    } catch (e) {
      throw new BadRequestException('Invalid Data: ' + e.message);
    }

    const user = await this.usersService.create({ lmsStudentId: userId });

    return this.activityProvidersClient.provide(
      activityUrl,
      activity._id,
      user._id.toString(),
      activity.parameters,
    );
  }
}
