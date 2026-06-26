import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsSanitizedEmail } from '../decorators/is-sanitized-email.decorator';
import { IsSecurePassword } from '../decorators/is-secure-password.decorator';
import { IsValidName } from '../decorators/is-valid-name.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'example@test.com' })
  @IsSanitizedEmail()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsSecurePassword()
  password: string;

  @IsOptional()
  @ApiProperty({ example: 'Test', required: false })
  @IsValidName()
  firstName?: string;

  @IsOptional()
  @ApiProperty({ example: 'User', required: false })
  @IsValidName()
  lastName?: string;
}
