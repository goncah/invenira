import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { MongoId } from '../../mongo-id';
import {
  CreateObjective,
  CreateObjectiveSchema,
  UpdateObjective,
  UpdateObjectiveSchema,
} from '@invenira/model';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { AuthorizedUser } from '../auth/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { INSTRUCTOR_ROLES, Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Roles(...INSTRUCTOR_ROLES)
  @Post()
  create(
    @AuthorizedUser() user: string,
    @Body(new ZodValidationPipe(CreateObjectiveSchema))
    createObjective: CreateObjective,
  ) {
    createObjective['createdBy'] = user;
    createObjective['updatedBy'] = user;
    return this.objectivesService.create(createObjective);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get()
  findAll() {
    return this.objectivesService.findAll();
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id')
  findOne(@MongoId() id: string) {
    return this.objectivesService.findOne(id);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Get(':id/details')
  getOne(@MongoId() id: string) {
    return this.objectivesService.getOne(id);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Patch(':id')
  update(
    @AuthorizedUser() user: string,
    @MongoId() id: string,
    @Body(new ZodValidationPipe(UpdateObjectiveSchema))
    updateObjective: UpdateObjective,
  ) {
    updateObjective['updatedBy'] = user;
    return this.objectivesService.update(id, updateObjective);
  }

  @Roles(...INSTRUCTOR_ROLES)
  @Delete(':id')
  remove(@MongoId() id: string) {
    return this.objectivesService.remove(id);
  }
}
