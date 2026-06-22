import { ApiProperty } from "@nestjs/swagger";


export class RegisterDto {
    @ApiProperty({ example: 'example@test.com'})
    email: string;

    @ApiProperty({ example: 'password123'})
    password: string;

    @ApiProperty({ example: 'Test', required: false})
    firstName?: string;

    @ApiProperty({ example: 'User', required: false})
    lastName?: string;
}