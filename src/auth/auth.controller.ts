import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../../generated/prisma/enums.cjs';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

type AuthenticatedRequest = Request & {
    user: {
        id: string;
        email: string;
        role: string;
    };
};

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() request: AuthenticatedRequest) {
        return request.user
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin')
    adminOnly() {
        return {
            message: 'Welcome admin',
        }; 
    }   

    @Post('refresh')
    refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshTokens(refreshTokenDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Req() request: AuthenticatedRequest) {
        return this.authService.logout(request.user.id);
    }
}
