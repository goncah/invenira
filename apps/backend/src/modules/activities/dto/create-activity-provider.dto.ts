import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { CreateActivityProvider } from '@invenira/model';

@ApiSchema({ name: 'CreateActivityProviderRequest' })
export class CreateActivityProviderDto implements CreateActivityProvider {
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}
