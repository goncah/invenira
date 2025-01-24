import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { AuthorizedUser } from '../auth/user.decorator';
import {
  Activity,
  CreateActivity,
  CreateActivitySchema,
  UpdateActivity,
  UpdateActivitySchema,
} from '@invenira/model';
import { Public } from '../auth/public';
import { MongoId } from '../../mongo-id';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Roles(...INSTRUCTOR_ROLES)
  @Post()
  async create(
    @AuthorizedUser() user: string,
    @Body(new ZodValidationPipe(CreateActivitySchema))
    createActivity: CreateActivity,
  ): Promise<Activity> {
    createActivity['createdBy'] = user;
    createActivity['updatedBy'] = user;
    return this.activitiesService.createActivity(createActivity);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get()
  async findAll(): Promise<Activity[]> {
    return this.activitiesService.findAllActivities();
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id')
  async findOne(@MongoId() id: string): Promise<Activity> {
    return this.activitiesService.findOneActivity(id);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Patch(':id')
  async update(
    @AuthorizedUser() user: string,
    @MongoId() id: string,
    @Body(new ZodValidationPipe(UpdateActivitySchema))
    updateActivityDto: UpdateActivity,
  ): Promise<Activity> {
    updateActivityDto['updatedBy'] = user;
    return this.activitiesService.updateActivity(id, updateActivityDto);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Delete(':id')
  async remove(@MongoId() id: string): Promise<Activity> {
    return this.activitiesService.removeActivity(id);
  }

  @Public()
  @Get(':id/provide')
  @Redirect('', 302)
  async provide(
    @MongoId() id: string,
    @Query('userId') userId: string,
    @Query('data') data: any,
  ) {
    return this.activitiesService.provide(id, userId, data).then((url) => {
      return { url };
    });
  }
}
