import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { ConfigInterface } from '@invenira/model';

@ApiSchema({ name: 'ConfigurationInterfaceRequest' })
export class ConfigInterfaceDto implements ConfigInterface {
  @ApiProperty()
  url: string;
}
