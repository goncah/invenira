import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { UpdateActivityProvider } from '@invenira/model';

@ApiSchema({ name: 'UpdateActivityProviderRequest' })
export class UpdateActivityProviderDto implements UpdateActivityProvider {
  @ApiProperty()
  url: string;
}
