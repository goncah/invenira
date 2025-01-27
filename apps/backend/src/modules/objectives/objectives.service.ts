import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateObjective, UpdateObjective } from '@invenira/model';
import { ObjectiveEntity } from './objective.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IapsService } from '../iaps/iaps.service';

@Injectable()
export class ObjectivesService {
  constructor(
    @InjectModel(ObjectiveEntity.name)
    private objectiveModel: Model<ObjectiveEntity>,
    private iapsService: IapsService,
  ) {}

  async create(createObjective: CreateObjective) {
    const iap = await this.iapsService.findOne(createObjective.iapId);

    if (!iap) {
      throw new NotFoundException(`IAP ${createObjective.iapId} not found`);
    }

    return this.objectiveModel.create(createObjective);
  }

  findAll() {
    return this.objectiveModel.find().exec();
  }

  findOne(id: string) {
    return this.objectiveModel.findOne({ _id: id }).exec();
  }

  update(id: string, updateObjective: UpdateObjective) {
    return this.objectiveModel
      .findByIdAndUpdate({ _id: id }, updateObjective, {
        new: true,
        upsert: true,
      })
      .exec();
  }

  remove(id: string) {
    return this.objectiveModel.findByIdAndDelete({ _id: id }).exec();
  }
}
