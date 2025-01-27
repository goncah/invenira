import { Injectable, NotFoundException } from '@nestjs/common';
import { IapEntity } from './iap.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivitiesService } from '../activities/activities.service';
import { EventBusService } from '../utils/event-bus-service';
import { AddActivityToIap, CreateIap, Iap, UpdateIap } from '@invenira/model';

@Injectable()
export class IapsService {
  constructor(
    @InjectModel(IapEntity.name)
    private iapModel: Model<IapEntity>,
    private activitiesService: ActivitiesService,
    private eventBus: EventBusService,
  ) {
    this.setupEvents(this.eventBus);
  }

  async create(createIapDto: CreateIap): Promise<Iap> {
    return this.iapModel.create(createIapDto);
  }

  async addActivity(
    id: string,
    addActivityToIapDto: AddActivityToIap,
  ): Promise<Iap> {
    return this.iapModel
      .findOneAndUpdate(
        { _id: id },
        {
          $push: { activityIds: addActivityToIapDto.activityId },
        },
      )
      .exec();
  }

  async removeActivity(id: string, activityId: string): Promise<Iap> {
    return this.iapModel
      .findOneAndUpdate(
        { _id: id },
        {
          $pull: { activityIds: activityId },
        },
      )
      .exec();
  }

  async deploy(id: string, baseUrl: string): Promise<Iap> {
    const iap = await this.findOne(id);

    if (!iap) {
      throw new NotFoundException(`IAP with Id ${id} not found`);
    }

    return new Promise((resolve, reject) => {
      this.iapModel.startSession().then((session) => {
        session.startTransaction();

        iap.activityIds
          .reduce(async (p, _id) => {
            await p;
            const url = await this.activitiesService.deploy(_id.toString());
            const data = btoa(JSON.stringify({ activityUrl: url }));
            const provideUrl =
              baseUrl +
              '/activities/' +
              _id.toString() +
              '/provide?data=' +
              data;
            iap.deployUrls.set(_id.toString(), provideUrl);
          }, Promise.resolve())
          .then(async () => {
            iap.isDeployed = true;
            return await this.update(id, iap);
          })
          .then((r) => {
            session.commitTransaction();
            resolve(r);
          })
          .catch((err) => {
            session.abortTransaction();
            reject(err);
          });
      });
    });
  }

  async findAll(): Promise<Iap[]> {
    return this.iapModel.find().exec();
  }

  async findOne(id: string): Promise<Iap> {
    return this.iapModel.findOne({ _id: id }).exec();
  }

  async findMetrics(id: string): Promise<string[]> {
    const iap = await this.findOne(id);

    if (!iap) {
      throw new NotFoundException(`IAP with Id ${id} not found`);
    }

    const metrics = await iap.activityIds
      .map(async (activityId: string) => {
        const activity =
          await this.activitiesService.findOneActivity(activityId);
        const metrics =
          await this.activitiesService.findOneActivityMetrics(activityId);

        return {
          id: activity.name.replace(/[^a-zA-Z]/g, ''),
          metrics: metrics,
        };
      })
      .reduce(async (pv, cv) => {
        const previous = await pv;
        const current = await cv;

        current.metrics.qualAnalytics = current.metrics.qualAnalytics.map(
          (q) => {
            return {
              name: current.id + '.' + q.name,
              type: q.type,
            };
          },
        );

        current.metrics.quantAnalytics = current.metrics.quantAnalytics.map(
          (q) => {
            return {
              name: current.id + '.' + q.name,
              type: q.type,
            };
          },
        );

        if (!previous) {
          return current;
        }

        previous.metrics.qualAnalytics.forEach((q) => {
          current.metrics.qualAnalytics.push({
            name: previous.id + '.' + q.name,
            type: q.type,
          });
        });

        previous.metrics.quantAnalytics.forEach((q) => {
          current.metrics.quantAnalytics.push({
            name: previous.id + '.' + q.name,
            type: q.type,
          });
        });

        return current;
      });

    return metrics.metrics.qualAnalytics.map((q) => q.name);
  }

  async update(id: string, updateIapDto: UpdateIap): Promise<Iap> {
    return this.iapModel
      .findByIdAndUpdate({ _id: id }, updateIapDto, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  async remove(id: string): Promise<Iap> {
    return this.iapModel.findByIdAndDelete({ _id: id }).exec();
  }

  setupEvents(eventBus: EventBusService): void {
    eventBus.on('iap.uses.activity', async (activityId: string) => {
      const iap = await this.iapModel.findOne({
        activityIds: activityId,
      });

      return { used: !!iap };
    });
  }
}
