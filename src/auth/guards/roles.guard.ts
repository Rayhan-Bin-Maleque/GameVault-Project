
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { UserRole } from '../../users/entities/user.entity.js';

interface AuthenticatedRequest {
    user?: {
        id?: string;
        email?: string;
        role?: UserRole;
    };
    url: string;
}

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {

        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            'roles',
            [
                context.getHandler(),
                context.getClass(),
            ],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const user = request.user;

        console.log('=== ROLE DEBUG ==');

        console.log({
            userId: user?.id,
            userRole: user?.role,
            requiredRoles,
            requestUrl: request.url,
        });

        console.log('=============');

        if (!user || !requiredRoles.includes(user.role as UserRole)) {
            throw new ForbiddenException(
                'You do not have permission to access this resource',
            );
        }

        return true;
    }
}
