import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { UpdateIap } from '@invenira/model';

@ApiSchema({ name: 'UpdateIAPRequest' })
export class UpdateIapDto implements UpdateIap {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
