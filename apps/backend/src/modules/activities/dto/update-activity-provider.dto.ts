import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityProviderDto } from './create-activity-provider.dto';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateActivityProviderRequest' })
export class UpdateActivityProviderDto extends PartialType(
  CreateActivityProviderDto,
) {
  @ApiProperty()
  url: string;
}
