import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { CreateIap } from '@invenira/model';

@ApiSchema({ name: 'CreateIAPRequest' })
export class CreateIapDto implements CreateIap {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
