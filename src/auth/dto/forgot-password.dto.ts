import { ApiProperty } from '@nestjs/swagger';
import { IsSanitizedEmail } from '../decorators/is-sanitized-email.decorator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'example@email.com' })
  @IsSanitizedEmail()
  email: string;
}
