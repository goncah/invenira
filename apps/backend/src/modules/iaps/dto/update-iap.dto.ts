import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UpdateIAPRequest' })
export class UpdateIapDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
