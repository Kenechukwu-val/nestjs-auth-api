import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    create(data: CreateUserDto & { password: string }) {
        return this.prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
    }

    findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    updateRefreshTokenHash(id: string, refreshTokenHash: string) {
        return this.prisma.user.update({
            where: { id },
            data: { refreshTokenHash },
        });
    }

    clearRefreshToken(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { refreshTokenHash: null },
        });
    }

    updatePasswordResetToken(id: string, passwordResetToken: string, passwordResetExpires: Date, ) {
        return this.prisma.user.update({
            where: { id },
            data: {
                passwordResetToken,
                passwordResetExpires
            },
        });
    }

    findByPasswordResetToken(passwordResetToken: string) {
        return this.prisma.user.findFirst({
            where: { passwordResetToken },
        });
    }

    updatePassword(id: string, password: string) {
        return this.prisma.user.update({
            where: { id },
            data: {
                password,
                passwordResetToken: null,
                passwordResetExpires: null,
                refreshTokenHash: null,
            },
        });
    }
}
