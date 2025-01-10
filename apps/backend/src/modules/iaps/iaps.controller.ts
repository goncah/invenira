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
import { CreateIapDto } from './dto/create-iap.dto';
import { UpdateIapDto } from './dto/update-iap.dto';
import { AddActivityToIapDto } from './dto/add-activity-to-iap.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { AuthorizedUser } from '../auth/user.decorator';
import { MongoId } from '../../mongo-id';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('iaps')
export class IapsController {
  constructor(private readonly iapsService: IapsService) {}

  @Roles(...INSTRUCTOR_ROLES)
  @Post()
  async create(
    @AuthorizedUser() user: string,
    @Body() createIapDto: CreateIapDto,
  ) {
    createIapDto['createdBy'] = user;
    createIapDto['updatedBy'] = user;
    return this.iapsService.create(createIapDto);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Post(':id/activities')
  async addActivity(
    @MongoId() id: string,
    @Body() addActivityToIapDto: AddActivityToIapDto,
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
    @Body() updateIapDto: UpdateIapDto,
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
