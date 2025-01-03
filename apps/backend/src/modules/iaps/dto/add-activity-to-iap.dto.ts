import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateIAPRequest' })
export class AddActivityToIapDto {
  @ApiProperty()
  activityId: string;
}
