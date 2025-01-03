import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ApiResponse } from '@nestjs/swagger';
import { Activity } from './entities/activity.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { AuthorizedUser } from '../auth/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    type: Activity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Post()
  async create(
    @AuthorizedUser() user: string,
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<Activity> {
    createActivityDto['createdBy'] = user;
    createActivityDto['updatedBy'] = user;
    return this.activitiesService.createActivity(createActivityDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: [Activity],
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Get()
  async findAll(): Promise<Activity[]> {
    return this.activitiesService.findAllActivities();
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: Activity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOneActivity(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: Activity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Patch(':id')
  async update(
    @AuthorizedUser() user: string,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    updateActivityDto['updatedBy'] = user;
    return this.activitiesService.updateActivity(id, updateActivityDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: Activity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.removeActivity(id);
  }
}
