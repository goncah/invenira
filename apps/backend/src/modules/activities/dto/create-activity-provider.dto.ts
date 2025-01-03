import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateActivityProviderRequest' })
export class CreateActivityProviderDto {
  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  url: string;
}
