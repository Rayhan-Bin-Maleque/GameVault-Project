
import {Controller,Post,Body,UseGuards,} from '@nestjs/common';

import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,ApiBody,} from '@nestjs/swagger';

import { AuthService } from './auth.service.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

import { CreateStaffUserDto } from '../users/dto/create-staff-user.dto.js';

import { UserRole } from '../users/entities/user.entity.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { Roles } from './decorators/roles.decorator.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}



    @Post('register')
    @ApiOperation({summary: 'Register a new customer',description:'Creates a new customer account in GameVault. Newly registered users receive the CUSTOMER role by default.'})
    @ApiBody({
        type: RegisterDto,
        description: 'Customer registration information.',
    })
    @ApiResponse({status: 201,description: 'Customer registered successfully.'})
    @ApiResponse({status: 400,description: 'Invalid registration information.'})
    @ApiResponse({status: 409,description: 'Email address already exists.'})
    async register(
        @Body() user: RegisterDto,
    ): Promise<string> {
        return this.authService.registration(user);
    }



    @Post('login')
    @ApiOperation({summary: 'Login to GameVault',description:'Authenticates an active user using email and password. Returns a JWT access token that must be used for protected API endpoints.',})
    @ApiResponse({status: 201,description: 'Login successful. Returns a JWT access token as a string.',})
    @ApiResponse({status: 400, description: 'Invalid request or unexpected authentication error.',})
    @ApiResponse({status: 401,description: 'Invalid email, incorrect password or inactive account.',})
    async login(
        @Body() user: LoginDto,
    ): Promise<string> {
        return this.authService.login(user);
    }




    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('create-staff')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create a staff account',
        description:
            'Allows an authenticated administrator to create Publisher or Support staff accounts. ADMIN and CUSTOMER roles cannot be assigned through this endpoint.',
    })
    @ApiBody({
        type: CreateStaffUserDto,
        description: 'Staff account creation information.',
    })
    @ApiResponse({status: 201,description: 'Staff account created successfully. Password is excluded from the response.'})
    @ApiResponse({status: 400,description: 'Invalid staff information.'})
    @ApiResponse({status: 401,description: 'Unauthorized. JWT token is missing, invalid or expired.'})
    @ApiResponse({status: 403, description: 'Forbidden. Only administrators can create staff accounts.',})
    @ApiResponse({status: 409,description: 'Email address already exists.'})
    async createStaff(
        @Body() user: CreateStaffUserDto,
    ) {
        return this.authService.createStaffUser(user);
    }
}
