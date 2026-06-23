import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'test@example.com' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @Matches(/^(?!.*\.(com|net|org|co|io)\.\1$).+$/i, {
    message: 'email appears to contain a repeated domain ending',
  })
  email: string;
}