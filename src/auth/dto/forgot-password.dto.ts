import { ApiProperty } from "@nestjs/swagger";


export class ForgotPasswordDto {
  @ApiProperty({ example: 'example@email.com'})
  email: string;
}