import { ApiProperty } from '@nestjs/swagger';
import { IsHexadecimal, Length } from 'class-validator';
import { IsSecurePassword } from '../decorators/is-secure-password.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'b4a8f2c9e12d4f7a9b0c3d5e6f8a1b2c9d0e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
  })
  @IsHexadecimal()
  @Length(64, 64, {
    message: 'token must be exactly 64 hexadecimal characters',
  })
  token: string;

  @ApiProperty({ example: 'Password123' })
  @IsSecurePassword()
  password: string;
}
