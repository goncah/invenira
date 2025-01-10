import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { UpdateObjectiveDto } from './dto/update-objective.dto';
import { MongoId } from '../../mongo-id';

@Controller('objectives')
export class ObjectivesController {
  constructor(private readonly objectivesService: ObjectivesService) {}

  @Post()
  create(@Body() createObjectiveDto: CreateObjectiveDto) {
    return this.objectivesService.create(createObjectiveDto);
  }

  @Get()
  findAll() {
    return this.objectivesService.findAll();
  }

  @Get(':id')
  findOne(@MongoId() id: string) {
    return this.objectivesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @MongoId() id: string,
    @Body() updateObjectiveDto: UpdateObjectiveDto,
  ) {
    return this.objectivesService.update(+id, updateObjectiveDto);
  }

  @Delete(':id')
  remove(@MongoId() id: string) {
    return this.objectivesService.remove(+id);
  }
}
