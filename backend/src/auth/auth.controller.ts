import { Body, Controller, Get, Inject, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseService, verifyPassword } from '../database/database.service';
import { AuthGuard } from './auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  @Post('login')
  login(@Body() body: { email?: string; password?: string }) {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!email || !password) {
      throw new UnauthorizedException({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const user = this.db.db
      .prepare('SELECT id, name, email, phone, password_hash, role, is_active FROM users WHERE LOWER(email) = ?')
      .get(email) as
      | { id: number; name: string; email: string; phone: string | null; password_hash: string; role: string; is_active: number }
      | undefined;

    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      throw new UnauthorizedException({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const secret = process.env.JWT_SECRET || 'bella-bridal-super-secret-jwt-key-2026';
    const token = jwt.sign({ sub: user.id, role: user.role }, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout() {
    return { message: 'Đăng xuất thành công.' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@Req() req: { user: unknown }) {
    return { user: req.user };
  }
}
