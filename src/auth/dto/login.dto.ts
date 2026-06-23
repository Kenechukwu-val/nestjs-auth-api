import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { IsSanitizedEmail } from '../decorators/is-sanitized-email.decorator';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @IsSanitizedEmail()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @IsNotEmpty({ message: 'password should not be empty' })
  password: string; // Removed length and space restrictions
}
