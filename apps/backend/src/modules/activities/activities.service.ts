import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity } from './entities/activity.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '../../exceptions/bad.request.exception';
import { CreateActivityProviderDto } from './dto/create-activity-provider.dto';
import { ActivityProvider } from './entities/activity-provider.entity';
import { UpdateActivityProviderDto } from './dto/update-activity-provider.dto';
import { ActivityProvidersClient } from './activity-providers.client';
import { ConfigInterfaceDto } from './dto/config-interface.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name)
    private activityModel: Model<Activity>,
    @InjectModel(ActivityProvider.name)
    private readonly activityProviderModel: Model<ActivityProvider>,
    private readonly activityProvidersClient: ActivityProvidersClient,
  ) {}

  async createActivity(
    createActivityDto: CreateActivityDto,
  ): Promise<Activity> {
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

  async updateActivity(
    id: string,
    updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    const par = await this.getActivityParameters(
      updateActivityDto.activityProviderId,
    );

    if (!par.every((e) => updateActivityDto.parameters.has(e))) {
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
    return await this.activityModel.findByIdAndDelete({ _id: id }).exec();
  }

  async getActivitiesCountForProvider(providerId: string): Promise<number> {
    return this.activityModel.countDocuments({
      activityProviderId: providerId,
    });
  }

  async createActivityProvider(
    createActivityProviderDto: CreateActivityProviderDto,
  ): Promise<ActivityProvider> {
    if (createActivityProviderDto.url.endsWith('/')) {
      createActivityProviderDto.url = createActivityProviderDto.url.substring(
        0,
        createActivityProviderDto.url.length - 1,
      );
    }

    const par = await this.activityProvidersClient.getActivityParameters(
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

  async getConfigurationInterfaceUrl(id: string): Promise<ConfigInterfaceDto> {
    const ap = await this.findOneActivityProvider(id);
    const url = await this.activityProvidersClient.getConfigInterface(ap.url);

    return { url };
  }

  async updateActivityProvider(
    id: string,
    updateActivityProviderDto: UpdateActivityProviderDto,
  ): Promise<ActivityProvider> {
    if (updateActivityProviderDto.url.endsWith('/')) {
      updateActivityProviderDto.url = updateActivityProviderDto.url.substring(
        0,
        updateActivityProviderDto.url.length - 1,
      );
    }

    const par = await this.activityProvidersClient.getActivityParameters(
      updateActivityProviderDto.url,
    );

    return await this.activityProviderModel
      .findByIdAndUpdate({ _id: id }, updateActivityProviderDto, { new: true })
      .exec();
  }

  async removeActivityProvider(id: string): Promise<ActivityProvider> {
    return new Promise(async (resolve, reject) => {
      const count = await this.getActivitiesCountForProvider(id);

      if (count > 0) {
        reject(
          new BadRequestException(
            'Activities for the Activity Provider exists!',
          ),
        );
      } else {
        resolve(
          await this.activityProviderModel
            .findByIdAndDelete({ _id: id })
            .exec(),
        );
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
}
