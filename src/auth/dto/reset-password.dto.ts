import { ApiProperty } from "@nestjs/swagger";


export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NWViMGQ'})
  token: string;

  @ApiProperty({ example: 'example12345'})
  password: string;
}