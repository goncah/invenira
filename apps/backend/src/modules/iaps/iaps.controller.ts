import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { IapsService } from './iaps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { AuthorizedUser } from '../auth/user.decorator';
import { MongoId } from '../../mongo-id';
import {
  AddActivityToIap,
  AddActivityToIapSchema,
  CreateIap,
  CreateIapSchema,
  UpdateIap,
  UpdateIapSchema,
} from '@invenira/model';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('iaps')
export class IapsController {
  constructor(private readonly iapsService: IapsService) {}

  @Roles(...INSTRUCTOR_ROLES)
  @Post()
  async create(
    @AuthorizedUser() user: string,
    @Body(new ZodValidationPipe(CreateIapSchema)) createIapDto: CreateIap,
  ) {
    createIapDto['createdBy'] = user;
    createIapDto['updatedBy'] = user;
    return this.iapsService.create(createIapDto);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Post(':id/activities')
  async addActivity(
    @MongoId() id: string,
    @Body(new ZodValidationPipe(AddActivityToIapSchema))
    addActivityToIapDto: AddActivityToIap,
  ) {
    return this.iapsService.addActivity(id, addActivityToIapDto);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Delete(':id/activities/:activityId')
  async removeActivity(
    @MongoId() id: string,
    @Param('activityId') activityId: string,
  ) {
    return this.iapsService.removeActivity(id, activityId);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Patch(':id/deploy')
  async deploy(@MongoId() id: string, @Req() req: FastifyRequest) {
    return this.iapsService.deploy(id, req.protocol + '://' + req.hostname);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get()
  async findAll() {
    return this.iapsService.findAll();
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id')
  async findOne(@MongoId() id: string) {
    return this.iapsService.findOne(id);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Patch(':id')
  async update(
    @AuthorizedUser() user: string,
    @MongoId() id: string,
    @Body(new ZodValidationPipe(UpdateIapSchema)) updateIapDto: UpdateIap,
  ) {
    updateIapDto['updatedBy'] = user;
    return this.iapsService.update(id, updateIapDto);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Delete(':id')
  async remove(@MongoId() id: string) {
    return this.iapsService.remove(id);
  }
}
