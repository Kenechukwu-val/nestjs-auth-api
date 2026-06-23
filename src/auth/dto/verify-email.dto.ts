import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'b4a8f2c9e12d4f7a9b0c3d5e6f8a1b2c9d0e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
  })
  token: string;
}