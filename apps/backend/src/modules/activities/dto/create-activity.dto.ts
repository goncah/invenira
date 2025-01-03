import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateActivityRequest' })
export class CreateActivityDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  activityProviderId: string;

  @ApiProperty()
  parameters: Map<string, any>;
}
