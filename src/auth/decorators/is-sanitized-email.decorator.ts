import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';

export function IsSanitizedEmail() {
  return applyDecorators(
    // 1. Transform the input value safely
    Transform(({ value }) => {
      if (typeof value !== 'string') return value;
      return value.trim().toLowerCase();
    }),
    // 2. Enforce string type guard
    IsString(),
    // 3. Enforce general email format
    IsEmail(),
    // 4. Block double TLD typos (com.com, com.net, etc.)
    Matches(/^(?!.*\.(com|net|org|co|io)\.(com|net|org|co|io)$).+$/i, {
      message: 'email appears to contain a repeated or double domain ending',
    })
  );
}
