import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { LaundryServicesModule } from './laundry-services/laundry-services.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    UsersModule, 
    AuthModule, 
    TransactionsModule, 
    LaundryServicesModule, 
    DashboardModule, 
    ReportsModule, 
    AuditLogsModule, PrismaModule, NotificationsModule, InventoryModule
  ],
})
export class AppModule {}