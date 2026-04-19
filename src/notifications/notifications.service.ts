import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { timestamp: 'desc' }
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllAsRead() {
    return this.prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({
      where: { id }
    });
  }

  async clearAll() {
    return this.prisma.notification.deleteMany({});
  }
}