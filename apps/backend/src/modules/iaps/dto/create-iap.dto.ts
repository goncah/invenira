import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateIAPRequest' })
export class CreateIapDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
