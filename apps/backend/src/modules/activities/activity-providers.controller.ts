import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';
import { AuthorizedUser } from '../auth/user.decorator';
import {
  ActivityProvider,
  ConfigInterface,
  CreateActivityProvider,
  CreateActivityProviderSchema,
  UpdateActivityProvider,
  UpdateActivityProviderSchema,
} from '@invenira/model';
import { MongoId } from '../../mongo-id';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activity-providers')
export class ActivityProvidersController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Roles('app_admin')
  @UsePipes(new ZodValidationPipe(CreateActivityProviderSchema))
  @Post()
  async create(
    @AuthorizedUser() user: string,
    @Body() createActivityProviderDto: CreateActivityProvider,
  ): Promise<ActivityProvider> {
    createActivityProviderDto['createdBy'] = user;
    createActivityProviderDto['updatedBy'] = user;
    return this.activitiesService.createActivityProvider(
      createActivityProviderDto,
    );
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get()
  async findAll(): Promise<ActivityProvider[]> {
    return this.activitiesService.findAllActivityProviders();
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id')
  async findOne(@MongoId() id: string): Promise<ActivityProvider> {
    return this.activitiesService.findOneActivityProvider(id);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id/config-interface')
  async getConfigInterface(@MongoId() id: string): Promise<ConfigInterface> {
    return this.activitiesService.getConfigurationInterfaceUrl(id);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id/config-params')
  async getConfigParameters(@MongoId() id: string): Promise<string[]> {
    return this.activitiesService.getActivityParameters(id);
  }

  @Roles('app_admin')
  @UsePipes(new ZodValidationPipe(UpdateActivityProviderSchema))
  @Patch(':id')
  async update(
    @AuthorizedUser() user: string,
    @MongoId() id: string,
    @Body() updateActivityProviderDto: UpdateActivityProvider,
  ): Promise<ActivityProvider> {
    updateActivityProviderDto['updatedBy'] = user;
    return this.activitiesService.updateActivityProvider(
      id,
      updateActivityProviderDto,
    );
  }

  @Roles('app_admin')
  @Delete(':id')
  async remove(@MongoId() id: string): Promise<void> {
    return this.activitiesService.removeActivityProvider(id);
  }
}
