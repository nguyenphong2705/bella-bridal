import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { NotificationModule } from './notifications/notification.module';
import { PublicController } from './public/public.controller';

@Module({
  imports: [DatabaseModule, AuthModule, NotificationModule, AppointmentsModule],
  controllers: [PublicController, AdminController],
})
export class AppModule {}
