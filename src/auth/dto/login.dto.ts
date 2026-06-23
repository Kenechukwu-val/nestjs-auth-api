import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^\S+$/, {
    message: 'password must not contain spaces',
  })
  password: string;
}