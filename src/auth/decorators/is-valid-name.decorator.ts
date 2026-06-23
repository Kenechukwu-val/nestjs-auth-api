import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, Matches } from 'class-validator';

export function IsValidName() {
  return applyDecorators(
    // 1. Clean up whitespaces automatically
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;
      return value.trim();
    }),
    // 2. Ensure type safety
    IsString(),
    // 3. Prevent buffer overflows or unrealistic name lengths
    MaxLength(50),
    // 4. Validate layout allowing letters, inner hyphens, and apostrophes
    Matches(/^[A-Za-z]+(?:['-][A-Za-z]+)*$/, {
      message: 'name must contain only letters, hyphens, or apostrophes',
    })
  );
}
