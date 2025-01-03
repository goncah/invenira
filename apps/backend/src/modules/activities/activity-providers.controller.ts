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
import { CreateActivityProviderDto } from './dto/create-activity-provider.dto';
import { UpdateActivityProviderDto } from './dto/update-activity-provider.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ActivityProviderEntity } from './entities/activity-provider.entity';
import { ActivitiesService } from './activities.service';
import { ConfigInterfaceDto } from './dto/config-interface.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { AuthorizedUser } from '../auth/user.decorator';
import { ActivityProvider } from '@invenira/model';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-providers')
export class ActivityProvidersController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityProviderEntity,
  })
  @Roles('app_admin')
  @Post()
  async create(
    @AuthorizedUser() user: string,
    @Body() createActivityProviderDto: CreateActivityProviderDto,
  ): Promise<ActivityProvider> {
    createActivityProviderDto['createdBy'] = user;
    createActivityProviderDto['updatedBy'] = user;
    return this.activitiesService.createActivityProvider(
      createActivityProviderDto,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: [ActivityProviderEntity],
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Get()
  async findAll(): Promise<ActivityProvider[]> {
    return this.activitiesService.findAllActivityProviders();
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityProviderEntity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ActivityProvider> {
    return this.activitiesService.findOneActivityProvider(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityProviderEntity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id/config-interface')
  async getConfigInterface(
    @Param('id') id: string,
  ): Promise<ConfigInterfaceDto> {
    return this.activitiesService.getConfigurationInterfaceUrl(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityProviderEntity,
  })
  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id/config-params')
  async getConfigParameters(@Param('id') id: string): Promise<string[]> {
    return this.activitiesService.getActivityParameters(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityProviderEntity,
  })
  @Roles('app_admin')
  @Patch(':id')
  async update(
    @AuthorizedUser() user: string,
    @Param('id') id: string,
    @Body() updateActivityProviderDto: UpdateActivityProviderDto,
  ): Promise<ActivityProvider> {
    updateActivityProviderDto['updatedBy'] = user;
    return this.activitiesService.updateActivityProvider(
      id,
      updateActivityProviderDto,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityProviderEntity,
  })
  @Roles('app_admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.activitiesService.removeActivityProvider(id);
  }
}
