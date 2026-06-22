import { Role } from '../../../generated/prisma/enums.cjs';

export type JwtPayload = {
    sub: string;
    email: string;
    role: Role;
}