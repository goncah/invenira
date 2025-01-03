import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'CreateUserRequest' })
export class CreateUserDto {
  @ApiProperty()
  lmsStudentId: string;
}
