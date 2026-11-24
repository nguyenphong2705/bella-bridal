import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../database/database.service';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly db: DatabaseService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({ message: 'Vui lòng đăng nhập để tiếp tục.' });
    }
    const token = authHeader.slice(7).trim();
    try {
      const secret = process.env.JWT_SECRET || 'bella-bridal-super-secret-jwt-key-2026';
      const payload = jwt.verify(token, secret) as unknown as { sub: number; role: string };
      const user = this.db.db
        .prepare('SELECT id, name, email, phone, role, is_active FROM users WHERE id = ?')
        .get(payload.sub) as (AuthUser & { is_active: number }) | undefined;

      if (!user || !user.is_active) {
        throw new UnauthorizedException({ message: 'Tài khoản không tồn tại hoặc đã bị khóa.' });
      }
      req.user = user;
      return true;
    } catch {
      throw new UnauthorizedException({ message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.' });
    }
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user = req.user as AuthUser | undefined;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    return true;
  }
}
