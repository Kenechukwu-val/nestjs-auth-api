import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'example@test.com' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @Matches(/^(?!.*\.(com|net|org|co|io)\.\1$).+$/i, {
    message: 'email appears to contain a repeated domain ending',
  })
  email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Test', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ example: 'User', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}