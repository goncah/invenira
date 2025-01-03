import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { CreateActivity } from '@invenira/model';

@ApiSchema({ name: 'CreateActivityRequest' })
export class CreateActivityDto implements CreateActivity {
  @ApiProperty()
  name: string;

  @ApiProperty()
  activityProviderId: string;

  @ApiProperty()
  parameters: Map<string, any>;
}
