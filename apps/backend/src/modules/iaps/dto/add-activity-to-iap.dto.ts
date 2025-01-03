import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { AddActivityToIap } from '@invenira/model';

@ApiSchema({ name: 'CreateIAPRequest' })
export class AddActivityToIapDto implements AddActivityToIap {
  @ApiProperty()
  activityId: string;
}
