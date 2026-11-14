
import {Controller,Get,UseGuards,Req,Param,NotFoundException,Patch,Delete,} from '@nestjs/common';

import {ApiTags,ApiOperation,ApiResponse,ApiBearerAuth,} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from './entities/user.entity.js';
import { UsersService } from './users.service.js';


@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}




  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({summary: 'Get logged-in user profile',description: 'Returns the basic profile information of the currently authenticated user using the JWT access token.'})
  @ApiResponse({status: 200,description: 'User profile retrieved successfully.'})
  @ApiResponse({status: 401,description: 'Unauthorized - Missing, invalid or expired JWT token.',})
  getProfile(@Req() req: any) {
    return req.user;
  }


  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-test')
  @ApiOperation({summary: 'Test Admin access',description: 'Verifies whether the authenticated user has administrator privileges.',})
  @ApiResponse({status: 200,description: 'Admin access granted.'})
  @ApiResponse({status: 401,description: 'Unauthorized - Missing, invalid or expired JWT token.',})
  @ApiResponse({status: 403,description: 'Forbidden - Admin role required.'})
  adminTest() {
    return {
      message: 'Welcome Admin! Access granted.',
    };
  }




  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({summary: 'Get all users',description: 'Allows administrators to retrieve all registered users. Password information is excluded from the response.',})
  @ApiResponse({status: 200,description: 'Users retrieved successfully.'})
  @ApiResponse({status: 401,description: 'Unauthorized - Missing or invalid JWT token.',})
  @ApiResponse({status: 403,description: 'Forbidden - Admin access required.',})
  async findAll() {
    return this.usersService.findall();
  }




  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({summary: 'Get user by ID',description: 'Allows administrators to retrieve a specific user account using its UUID. Password information is excluded.',})
 
  @ApiResponse({status: 200,description: 'User retrieved successfully.'})
  @ApiResponse({status: 401,description: 'Unauthorized - Missing or invalid JWT token.',})
  @ApiResponse({status: 403,description: 'Forbidden - Admin access required.'})
  @ApiResponse({status: 404,description: 'User not found.',})
  async findOne(
    @Param('id') id: string,
  ) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(
        `User with ID ${id} not found`,
      );
    }

    return user;
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({summary: 'Toggle user account status',description: 'Allows administrators to toggle a user account between active and inactive. Each request reverses the current isActive value. No request body is required.',})
  
  @ApiResponse({status: 200,description: 'User account status updated successfully. Password information is excluded.'})
  @ApiResponse({status: 401,description: 'Unauthorized - Missing or invalid JWT token.'})
  @ApiResponse({status: 403,description: 'Forbidden - Admin access required.',})
  @ApiResponse({status: 404,description: 'User not found.',})
  async updateUserStatus(
    @Param('id') id: string,
  ) {
    const user = await this.usersService.updateUserStatus(id);

    const { password, ...result } = user;

    return result;
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({summary: 'Delete user account',description: 'Allows administrators to delete a user account. Administrator accounts cannot be deleted through this endpoint.',})
  @ApiResponse({status: 200,description: 'User deleted successfully.'})
  @ApiResponse({status: 400,description: 'Account cannot be deleted. Administrator accounts are protected.'})
  @ApiResponse({status: 401,description: 'Unauthorized - Missing or invalid JWT token.'})
  @ApiResponse({status: 403,description: 'Forbidden - Admin access required.'})
  @ApiResponse({status: 404,description: 'User not found.'})
  async deleteUser(
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(id);
  }

}
