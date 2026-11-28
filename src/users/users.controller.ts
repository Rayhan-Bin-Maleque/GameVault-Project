import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  NotFoundException,
  Patch,
  Delete,
} from '@nestjs/common';

import {
<<<<<<< Updated upstream
=======
  Body,
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  NotFoundException,
  Patch,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';

import {
>>>>>>> Stashed changes
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UserRole } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

<<<<<<< Updated upstream
=======
interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

>>>>>>> Stashed changes
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
<<<<<<< Updated upstream
  constructor(private readonly usersService: UsersService) {}

=======
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // Get logged-in user profile
>>>>>>> Stashed changes
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get logged-in user profile',
<<<<<<< Updated upstream
    description:
      'Returns the basic profile information of the currently authenticated user using the JWT access token.',
=======
    description: 'Returns the safe profile of the authenticated user.',
>>>>>>> Stashed changes
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
<<<<<<< Updated upstream
    description: 'Unauthorized - Missing, invalid or expired JWT token.',
  })
  getProfile(@Req() req: any) {
    return req.user;
  }

  //@ApiParam({ name: 'id', description: 'User ID' })
=======
    description: 'Unauthorized.',
  })
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.usersService.getProfile(req.user.id);
  }

  // Update logged-in user profile
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({
    summary: 'Update logged-in user profile',
    description:
      'Allows an authenticated user to update their own name and email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile information.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Email address already in use.',
  })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() profile: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      req.user.id,
      profile,
    );
  }

  // Admin test endpoint
>>>>>>> Stashed changes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-test')
  @ApiOperation({
    summary: 'Test Admin access',
<<<<<<< Updated upstream
    description:
      'Verifies whether the authenticated user has administrator privileges.',
  })
  @ApiResponse({ status: 200, description: 'Admin access granted.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing, invalid or expired JWT token.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required.' })
=======
    description: 'Verifies administrator privileges.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin access granted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
>>>>>>> Stashed changes
  adminTest() {
    return {
      message: 'Welcome Admin! Access granted.',
    };
  }

<<<<<<< Updated upstream
=======
  // Get all users (Admin only)
>>>>>>> Stashed changes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'Get all users',
<<<<<<< Updated upstream
    description:
      'Allows administrators to retrieve all registered users. Password information is excluded from the response.',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
=======
    description: 'Returns all users without password information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
>>>>>>> Stashed changes
  async findAll() {
    return this.usersService.findall();
  }

<<<<<<< Updated upstream
=======
  // Get user by ID (Admin only)
>>>>>>> Stashed changes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
<<<<<<< Updated upstream
    description:
      'Allows administrators to retrieve a specific user account using its UUID. Password information is excluded.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
=======
    description: 'Allows administrators to retrieve a user by UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid UUID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
>>>>>>> Stashed changes
    }

    return user;
  }

<<<<<<< Updated upstream
=======
  // Toggle user status (Admin only)
>>>>>>> Stashed changes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({
    summary: 'Toggle user account status',
<<<<<<< Updated upstream
    description:
      'Allows administrators to toggle a user account between active and inactive. Each request reverses the current isActive value. No request body is required.',
  })
  @ApiParam({ name: 'id', description: 'User ID', type: String })
  @ApiResponse({
    status: 200,
    description:
      'User account status updated successfully. Password information is excluded.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserStatus(@Param('id') id: string) {
=======
    description: 'Activates or deactivates a user account.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid operation or UUID.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUserStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.id === id) {
      throw new BadRequestException(
        'Administrators cannot change their own account status.',
      );
    }

>>>>>>> Stashed changes
    const user = await this.usersService.updateUserStatus(id);

    const { password: _password, ...result } = user;

    return result;
  }

<<<<<<< Updated upstream
=======
  // Delete user (Admin only)
>>>>>>> Stashed changes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user account',
    description:
<<<<<<< Updated upstream
      'Allows administrators to delete a user account. Administrator accounts cannot be deleted through this endpoint.',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({
    status: 400,
    description:
      'Account cannot be deleted. Administrator accounts are protected.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(@Param('id') id: string) {
=======
      'Allows administrators to delete non-admin user accounts.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Account cannot be deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Admin access required.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async deleteUser(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.id === id) {
      throw new BadRequestException(
        'Administrators cannot delete their own account.',
      );
    }

>>>>>>> Stashed changes
    return this.usersService.deleteUser(id);
  }
}
