import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, Matches } from "class-validator";


export class ForgotPasswordDto {
  @ApiProperty({ example: 'example@email.com'})
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @Matches(/^(?!.*\.(com|net|org|co|io)\.\1$).+$/i, {
    message: 'email appears to contain a repeated domain ending',
  })
  email: string;
}