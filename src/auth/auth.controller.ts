
import {
    Controller,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

import { CreateStaffUserDto } from '../users/dto/create-staff-user.dto.js';
import { UserRole } from '../users/entities/user.entity.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() user: RegisterDto): Promise<string> {
        return this.authService.registration(user);
    }

    @Post('login')
    async login(@Body() user: LoginDto): Promise<string> {
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('create-staff')
    async createStaff(@Body() user: CreateStaffUserDto) {
        return this.authService.createStaffUser(user);
    }
}
