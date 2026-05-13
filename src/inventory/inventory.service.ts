import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // FIXED: Dinagdagan ng 'unit' field dahil required ito sa Prisma schema mo
  async create(dto: CreateInventoryDto) {
    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        currentValue: dto.currentValue,
        maxValue: dto.maxValue,
        unit: dto.unit, // <-- mahalaga ito para hindi mag-error ang Prisma
      },
    });
  }

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
        isLowStock: percentage <= 20, 
      };
    });
  }

  // Kapag kinlick yung Save icon sa iisang item
  async restockItem(id: string, dto: UpdateInventoryDto) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');

    const updatedItem = await this.prisma.inventoryItem.update({
      where: { id },
      data: { currentValue: dto.currentValue },
    });

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
    
    const lowItems = items.filter(
      (item) => (item.currentValue / item.maxValue) * 100 <= 20
    );

    if (lowItems.length === 0) {
      return { message: 'No items are currently low on stock.' };
    }

    for (const item of lowItems) {
      await this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: { currentValue: item.maxValue },
      });
    }

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