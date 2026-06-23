import { ApiProperty } from '@nestjs/swagger';
import { IsSanitizedEmail } from '../decorators/is-sanitized-email.decorator';

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsSanitizedEmail()
  email: string;
}
