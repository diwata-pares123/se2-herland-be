import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // --- EXISTING LOGIC (Untouched) ---
  // ==========================================
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

  // ==========================================
  // --- NEW LOGIC FOR NOTIFICATION SETTINGS ---
  // ==========================================

  async getSettings(userId: string) {
    // Look for existing settings based on the user's ID
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { id: userId },
    });

    // If none exist yet (e.g., old users), create default settings for them
    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: { id: userId },
      });
    }

    return settings;
  }

  async updateSettings(userId: string, data: any) {
    // Upsert means: Update if it exists, Create if it doesn't.
    return this.prisma.notificationSettings.upsert({
      where: { id: userId },
      update: data,
      create: {
        id: userId,
        ...data,
      },
    });
  }
}