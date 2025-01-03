import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIapDto } from './dto/create-iap.dto';
import { UpdateIapDto } from './dto/update-iap.dto';
import { Iap } from './entities/iap.entity';
import { AddActivityToIapDto } from './dto/add-activity-to-iap.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class IapsService {
  constructor(
    @InjectModel(Iap.name)
    private iapModel: Model<Iap>,
    private activitiesService: ActivitiesService,
  ) {}

  async create(createIapDto: CreateIapDto): Promise<Iap> {
    return await this.iapModel.create(createIapDto);
  }

  async addActivity(
    id: string,
    addActivityToIapDto: AddActivityToIapDto,
  ): Promise<Iap> {
    return await this.iapModel
      .findOneAndUpdate(
        { _id: id },
        {
          $push: { activityIds: addActivityToIapDto.activityId },
        },
      )
      .exec();
  }

  async removeActivity(id: string, activityId: string): Promise<Iap> {
    return await this.iapModel
      .findOneAndUpdate(
        { _id: id },
        {
          $pull: { activityIds: activityId },
        },
      )
      .exec();
  }

  async deploy(id: string): Promise<Iap> {
    const iap = await this.findOne(id);

    if (!iap) {
      throw new NotFoundException(`IAP with Id ${id} not found`);
    }

    return new Promise(async (resolve, reject) => {
      const session = await this.iapModel.startSession();
      session.startTransaction();

      iap.activityIds
        .reduce(async (p, _id) => {
          await p;
          const url = await this.activitiesService.deploy(_id.toString());
          iap.deployUrls.set(_id.toString(), url);
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
  }

  async findAll(): Promise<Iap[]> {
    return await this.iapModel.find().exec();
  }

  async findOne(id: string): Promise<Iap> {
    return await this.iapModel.findOne({ _id: id }).exec();
  }

  async update(id: string, updateIapDto: UpdateIapDto): Promise<Iap> {
    return await this.iapModel
      .findByIdAndUpdate({ _id: id }, updateIapDto, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  async remove(id: string): Promise<Iap> {
    return await this.iapModel.findByIdAndDelete({ _id: id }).exec();
  }
}
