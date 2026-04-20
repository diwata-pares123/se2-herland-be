import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, ServiceStatus, NotificationSettings } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // --- UPDATED: HELPER FUNCTION ACCEPTS userId TO CHECK CORRECT SETTINGS ---
  // =========================================================================
  private async shouldSendNotification(userId: string, settingKey: keyof NotificationSettings): Promise<boolean> {
    // Ngayon, kukunin na natin ang settings ng mismong user na naka-login!
    const settings = await this.prisma.notificationSettings.findUnique({
      where: { id: userId }
    });
    
    if (!settings) return true; 
    return settings[settingKey] === true;
  }

  // =========================================================================

  async create(userId: string, dto: CreateTransactionDto) { // Added userId here
    const service = await this.prisma.service.findFirst({
      where: { name: dto.serviceName },
    });

    if (!service) {
      throw new BadRequestException(`Service '${dto.serviceName}' not found.`);
    }

    const currentPaymentStatus = dto.paymentStatus || (dto.paymentMethod ? PaymentStatus.PAID : PaymentStatus.UNPAID);
    const invoiceString = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTransaction = await this.prisma.transaction.create({
      data: {
        invoiceNumber: invoiceString,
        customerName: dto.customerName,
        totalAmount: dto.amount,
        transactionDate: new Date(dto.transactionDate),
        paymentMethod: dto.paymentMethod,
        paymentStatus: currentPaymentStatus,
        serviceStatus: dto.serviceStatus || ServiceStatus.ON_GOING,
        items: {
          create: [
            {
              serviceId: service.id,
              quantity: 1, 
              priceAtTime: dto.amount, 
            }
          ]
        }
      },
      include: {
        items: {
          include: { service: true }
        }
      }
    });

    // --- CHECK PREFERENCES BAGO MAG-LOG NG NEW ENTRY ---
    if (await this.shouldSendNotification(userId, 'newOrders')) {
      await this.prisma.notification.create({
        data: {
          title: "New Order Received",
          message: `${dto.customerName} placed a new order for ${dto.serviceName}.`,
          type: "info"
        }
      });
    }

    return newTransaction;
  }

  async findAll() {
    const transactions = await this.prisma.transaction.findMany({
      where: { isDeleted: false }, 
      include: {
        items: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = transactions
      .filter((t) => t.paymentStatus === 'PAID')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      summary: {
        totalTransactions: transactions.length,
        totalRevenue: totalRevenue,
      },
      data: transactions,
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: id },
      include: {
        items: { include: { service: true } }
      }
    });

    if (!transaction || transaction.isDeleted) {
      throw new NotFoundException(`Transaction #${id} not found or deleted.`);
    }

    return transaction;
  }

  async update(id: string, dto: any, userId: string) { // Added userId here
    const existingTransaction = await this.prisma.transaction.findUnique({ where: { id } });
    
    if (!existingTransaction) {
      throw new NotFoundException(`Failed to update. Transaction #${id} not found.`);
    }

    const updateData: any = {};
    if (dto.customerName) updateData.customerName = dto.customerName;
    if (dto.amount) updateData.totalAmount = dto.amount; 
    if (dto.paymentMethod) updateData.paymentMethod = dto.paymentMethod;
    if (dto.paymentStatus) updateData.paymentStatus = dto.paymentStatus;
    if (dto.serviceStatus) updateData.serviceStatus = dto.serviceStatus;
    if (dto.transactionDate) updateData.transactionDate = new Date(dto.transactionDate);

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: id },
      data: updateData,
      include: {
        items: { include: { service: true } }
      }
    });

    // --- CHECK PREFERENCES BAGO MAG-LOG NG PAYMENT ---
    if (existingTransaction.paymentStatus !== 'PAID' && updatedTransaction.paymentStatus === 'PAID') {
      if (await this.shouldSendNotification(userId, 'paymentNotifications')) {
        await this.prisma.notification.create({
          data: {
            title: "Payment Received",
            message: `Payment received from ${updatedTransaction.customerName}.`,
            type: "success"
          }
        });
      }
    }

    // --- CHECK PREFERENCES BAGO MAG-LOG NG CLAIMED ---
    if (existingTransaction.serviceStatus !== 'CLAIMED' && updatedTransaction.serviceStatus === 'CLAIMED') {
      if (await this.shouldSendNotification(userId, 'orderCompletion')) {
        await this.prisma.notification.create({
          data: {
            title: "Order Claimed",
            message: `Order ${updatedTransaction.invoiceNumber} for ${updatedTransaction.customerName} has been claimed.`,
            type: "success"
          }
        });
      }
    }

    // --- CHECK PREFERENCES BAGO MAG-LOG NG CANCELLED ---
    if (existingTransaction.serviceStatus !== 'CANCELLED' && updatedTransaction.serviceStatus === 'CANCELLED') {
      if (await this.shouldSendNotification(userId, 'orderUpdates')) {
        await this.prisma.notification.create({
          data: {
            title: "Order Cancelled",
            message: `Order ${updatedTransaction.invoiceNumber} for ${updatedTransaction.customerName} has been cancelled.`,
            type: "error"
          }
        });
      }
    }

    return updatedTransaction;
  }

  async remove(id: string, userId: string) { // Added userId here
    const existingTransaction = await this.prisma.transaction.findUnique({ where: { id } });

    if (!existingTransaction) {
      throw new NotFoundException(`Failed to delete. Transaction #${id} not found.`);
    }

    await this.prisma.transactionItem.deleteMany({
      where: { transactionId: id },
    });

    const deletedTransaction = await this.prisma.transaction.delete({
      where: { id: id },
    });

    // --- CHECK PREFERENCES BAGO MAG-LOG NG DELETED ENTRY ---
    if (await this.shouldSendNotification(userId, 'orderUpdates')) {
      await this.prisma.notification.create({
        data: {
          title: "Order Deleted",
          message: `Order ${existingTransaction.invoiceNumber} for ${existingTransaction.customerName} was deleted.`,
          type: "error"
        }
      });
    }

    return { message: `Transaction #${id} has been permanently deleted.`, id: deletedTransaction.id };
  }
}