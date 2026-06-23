import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'test@example.com' })
  email: string;
}