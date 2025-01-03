import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'ConfigurationInterfaceRequest' })
export class ConfigInterfaceDto {
  @ApiProperty()
  url: string;
}
