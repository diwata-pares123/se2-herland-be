import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // Kunin ang lahat at i-compute ang percentage para madali sa UI
  async findAll() {
    const items = await this.prisma.inventoryItem.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => {
      const percentage = Math.round((item.currentValue / item.maxValue) * 100);
      return {
        ...item,
        levelPercentage: percentage,
        isLowStock: percentage <= 20, // 20% pababa (tulad ng nasa UI na Liquid Softener)
      };
    });
  }

  // Kapag kinlick yung Save icon sa iisang item
  async restockItem(id: string, dto: UpdateInventoryDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');

    // 1. I-update ang stock
    const updatedItem = await this.prisma.inventoryItem.update({
      where: { id },
      data: { currentValue: dto.currentValue },
    });

    // 2. Mag-create ng Notification batay sa UI success toast
    await this.prisma.notification.create({
      data: {
        title: 'Inventory Restocked',
        message: `Staff has been notified that ${updatedItem.name} is restocked!`,
        type: 'success',
      },
    });

    return updatedItem;
  }

  // Kapag kinlick yung "RESTOCK ALL LOW" button
  async restockAllLow() {
    const items = await this.prisma.inventoryItem.findMany();
    
    // Hanapin lang ang mga 20% pababa
    const lowItems = items.filter(
      (item) => (item.currentValue / item.maxValue) * 100 <= 20
    );

    if (lowItems.length === 0) {
      return { message: 'No items are currently low on stock.' };
    }

    // I-update lahat ng low items pabalik sa kanilag maxValue (100%)
    for (const item of lowItems) {
      await this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: { currentValue: item.maxValue },
      });
    }

    // Mag-create ng isang notification para sa mass restock
    await this.prisma.notification.create({
      data: {
        title: 'Mass Restock Completed',
        message: 'Staff has been notified that all low-level inventory items are restocked!',
        type: 'success',
      },
    });

    return { message: 'All low stock items have been restocked successfully.' };
  }
}