import {
    ConflictException,
    Injectable,
    UnauthorizedException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);

        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        const user = await this.usersService.create({
            ...registerDto,
            password: passwordHash,
        });

        const verificationToken = this.generateRawToken();
        const emailVerificationToken = this.hashToken(verificationToken);
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.usersService.updateEmailVerificationToken(
            user.id,
            emailVerificationToken,
            emailVerificationExpires,
        );

        try {
            await this.mailService.sendVerificationEmail(
                user.email,
                verificationToken,
            );
        } catch (error) {
            this.logger.error(
                `Failed to send verification email to ${user.email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }

        return {
            message:
                'Registration successful. Please check your email to verify your account',
            user,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        const dummyHash = '$2b$10$NotRealHashForTimingAttackMitigationJustADummyOne';

        const passwordMatches = await bcrypt.compare(
            loginDto.password,
            user ? user.password : dummyHash,
        )

        if (!user || !passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.emailVerified) {
            throw new UnauthorizedException(
                'Please verify your email before logging in',
            );
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const tokens = await this.generateTokens(payload);
        const refreshTokenHash = this.hashToken(tokens.refreshToken);

        await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    private async generateTokens(payload: JwtPayload) {
        const accessExpiresIn = this.configService.getOrThrow<
            JwtSignOptions['expiresIn']
        >('JWT_ACCESS_EXPIRES_IN');

        const refreshExpiresIn = this.configService.getOrThrow<
            JwtSignOptions['expiresIn']
        >('JWT_REFRESH_EXPIRES_IN');

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: accessExpiresIn,
            }),
            this.jwtService.signAsync(
                { ...payload, jti: randomUUID() },
                {
                    secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
                    expiresIn: refreshExpiresIn,
                },
            ),
        ]);

        return { accessToken, refreshToken };
    }

    async refreshTokens(refreshTokenDto: RefreshTokenDto) {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(
            refreshTokenDto.refreshToken,
            {
                secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            },
        );

        const user = await this.usersService.findById(payload.sub);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const refreshTokenMatches =
            this.hashToken(refreshTokenDto.refreshToken) === user.refreshTokenHash;

        if (!refreshTokenMatches) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshTokenHash = this.hashToken(tokens.refreshToken);

        await this.usersService.updateRefreshTokenHash(user.id, refreshTokenHash);

        return tokens;
    }

    async logout(userId: string) {
        await this.usersService.clearRefreshToken(userId);

        return {
            message: 'Logged out successfully',
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);

        if (!user) {
            return {
                message: 'If that email exists, a password reset link has been sent',
            };
        }

        const resetToken = randomBytes(32).toString('hex');
        const passwordResetToken = createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

        await this.usersService.updatePasswordResetToken(
            user.id,
            passwordResetToken,
            passwordResetExpires,
        );

        try {
            await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        } catch (error) {
            this.logger.error(
                `Failed to send password reset email to ${user.email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }

        return {
            message: 'If that email exists, a password reset link has been sent',
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const passwordResetToken = createHash('sha256')
            .update(resetPasswordDto.token)
            .digest('hex');

        const user =
            await this.usersService.findByPasswordResetToken(passwordResetToken);

        if (
            !user ||
            !user.passwordResetExpires ||
            user.passwordResetExpires < new Date()
        ) {
            throw new BadRequestException('Invalid or expired token');
        }

        const passwordHash = await bcrypt.hash(resetPasswordDto.password, 10);

        await this.usersService.updatePassword(user.id, passwordHash);

        return {
            message: 'Password reset successfully',
        };
    }

    private generateRawToken() {
        return randomBytes(32).toString('hex');
    }

    private hashToken(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }

    async verifyEmail(verifyEmailDto: VerifyEmailDto) {
        const emailVerificationToken = this.hashToken(verifyEmailDto.token);

        const user = await this.usersService.findByEmailVerificationToken(
            emailVerificationToken,
        );

        if (
            !user ||
            !user.emailVerificationExpires ||
            user.emailVerificationExpires < new Date()
        ) {
            throw new BadRequestException('Invalid or expired verification token');
        }

        await this.usersService.markEmailAsVerified(user.id);

        return {
            message: 'Email verified successfully',
        };
    }

    async resendVerificationEmail(
        resendVerificationEmailDto: ResendVerificationEmailDto,
    ) {
        const user = await this.usersService.findByEmail(
            resendVerificationEmailDto.email,
        );

        if (!user || user.emailVerified) {
            return {
                message:
                    'If verification is needed, a verification email has been sent',
            };
        }

        const verificationToken = this.generateRawToken();
        const emailVerificationToken = this.hashToken(verificationToken);
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.usersService.updateEmailVerificationToken(
            user.id,
            emailVerificationToken,
            emailVerificationExpires,
        );

        try {
            await this.mailService.sendVerificationEmail(
                user.email,
                verificationToken,
            );
        } catch (error) {
            this.logger.error(
                `Failed to send verification email to ${user.email}`,
                error instanceof Error ? error.stack : String(error),
            );
        }

        return {
            message: 'Verification token generated',
        };
    }
}
