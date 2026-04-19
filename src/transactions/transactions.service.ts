import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, ServiceStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
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

    // --- NEW: LOG NOTIFICATION FOR NEW ENTRY ---
    await this.prisma.notification.create({
      data: {
        title: "New Order Received",
        message: `${dto.customerName} placed a new order for ${dto.serviceName}.`,
        type: "info"
      }
    });

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

  async update(id: string, dto: any) {
    // Kukunin muna natin ang lumang data para ma-compare mamaya sa Notification
    const existingTransaction = await this.prisma.transaction.findUnique({ where: { id } });
    
    if (!existingTransaction) {
      throw new NotFoundException(`Failed to update. Transaction #${id} not found.`);
    }

    // --- FIX: MANUALLY MAP DATA PARA HINDI MAG-ERROR SA PRISMA ---
    const updateData: any = {};
    if (dto.customerName) updateData.customerName = dto.customerName;
    if (dto.amount) updateData.totalAmount = dto.amount; // Mapped 'amount' to 'totalAmount'
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

    // --- LOG NOTIFICATIONS FOR STATUS CHANGES ---
    if (existingTransaction.paymentStatus !== 'PAID' && updatedTransaction.paymentStatus === 'PAID') {
      await this.prisma.notification.create({
        data: {
          title: "Payment Received",
          message: `Payment received from ${updatedTransaction.customerName}.`,
          type: "success"
        }
      });
    }

    if (existingTransaction.serviceStatus !== 'CLAIMED' && updatedTransaction.serviceStatus === 'CLAIMED') {
      await this.prisma.notification.create({
        data: {
          title: "Order Claimed",
          message: `Order ${updatedTransaction.invoiceNumber} for ${updatedTransaction.customerName} has been claimed.`,
          type: "success"
        }
      });
    }

    // --- ADDED: LOG NOTIFICATION FOR CANCELLED STATUS ---
    if (existingTransaction.serviceStatus !== 'CANCELLED' && updatedTransaction.serviceStatus === 'CANCELLED') {
      await this.prisma.notification.create({
        data: {
          title: "Order Cancelled",
          message: `Order ${updatedTransaction.invoiceNumber} for ${updatedTransaction.customerName} has been cancelled.`,
          type: "error"
        }
      });
    }

    return updatedTransaction;
  }

  async remove(id: string) {
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

    // --- NEW: LOG NOTIFICATION FOR DELETED ENTRY ---
    await this.prisma.notification.create({
      data: {
        title: "Order Deleted",
        message: `Order ${existingTransaction.invoiceNumber} for ${existingTransaction.customerName} was deleted.`,
        type: "error"
      }
    });

    return { message: `Transaction #${id} has been permanently deleted.`, id: deletedTransaction.id };
  }
}