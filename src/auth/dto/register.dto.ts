import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
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
  @MaxLength(72)
  @Matches(/^\S+$/, {
    message: 'password must not contain spaces',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'Test', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z]+(?:['-][A-Za-z]+)*$/, {
    message: 'firstName must contain only letters, hyphens, or apostrophes',
  })
  firstName?: string;

  @ApiProperty({ example: 'User', required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z]+(?:['-][A-Za-z]+)*$/, {
    message: 'lastName must contain only letters, hyphens, or apostrophes',
  })
  lastName?: string;
}