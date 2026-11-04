
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { UserRole } from '../../users/entities/user.entity.js';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector
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

        const user = context.switchToHttp().getRequest().user;

        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                'You do not have permission to access this resource'
            );
        }

        return true;
    }
}
