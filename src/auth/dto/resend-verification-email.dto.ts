import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';

export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'test@example.com' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @IsEmail()
  @Matches(/^(?!.*\.(com|net|org|co|io)\.(com|net|org|co|io)$).+$/i, {
    message: 'email appears to contain a repeated or double domain ending',
  })
  email: string;
}
