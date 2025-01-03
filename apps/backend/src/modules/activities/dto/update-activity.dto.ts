import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateActivityRequest' })
export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @ApiProperty()
  parameters: Map<string, any>;
}
