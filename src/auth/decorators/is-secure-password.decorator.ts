import { applyDecorators } from '@nestjs/common';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export function IsSecurePassword() {
  return applyDecorators(
    // 1. Ensure type safety
    IsString(),
    // 2. Set strict length bounds
    MinLength(8),
    MaxLength(72),
    // 3. Block any whitespace characters
    Matches(/^\S+$/, {
      message: 'password must not contain spaces',
    }),
    // 4. Enforce complexity (at least one letter and one number)
    Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
      message: 'password must contain at least one letter and one number',
    }),
  );
}
