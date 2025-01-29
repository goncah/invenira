import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AnalyticsArray,
  CreateObjective,
  UpdateObjective,
} from '@invenira/model';
import { ObjectiveEntity } from './objective.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IapsService } from '../iaps/iaps.service';
import { divide, evaluate } from 'mathjs';
import { BadRequestException } from '../../exceptions/bad.request.exception';

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

    const metrics = await this.iapsService.findMetrics(createObjective.iapId);
    const vars = new Map<string, number>();

    metrics.forEach((metric) => {
      vars.set(metric, 0);
    });

    try {
      createObjective['value'] = evaluate(createObjective.formula, vars);
    } catch (e) {
      throw new BadRequestException(`Invalid formula: ${e.message}`);
    }

    return this.objectiveModel.create(createObjective);
  }

  async findAll() {
    let objectives = await this.objectiveModel.find().exec();

    const metrics: AnalyticsArray = await Promise.all(
      objectives.map(
        async (objective) => await this.iapsService.getMetrics(objective.iapId),
      ),
    ).then((data) => data.flat());

    const vars = new Map<string, Map<string, number>>();

    metrics.forEach((metric) => {
      const mVars = new Map<string, number>();
      metric.quantAnalytics.forEach((m) => {
        mVars.set(m.name, m.value);
      });

      vars.set(metric.inveniraStdID, mVars);
    });

    // Update objective values
    objectives = objectives.map((objective) => {
      let studentCount = 0;
      let valueSum = 0;

      vars.forEach((v) => {
        studentCount++;
        valueSum = evaluate(objective.formula, v);
      });

      objective.value = divide(valueSum, studentCount);
      return objective;
    });

    objectives.forEach((objective) => objective.save());

    return objectives;
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
