import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { UpdateActivity } from '@invenira/model';

@ApiSchema({ name: 'UpdateActivityRequest' })
export class UpdateActivityDto implements UpdateActivity {
  @ApiProperty()
  parameters: Map<string, any>;
}
