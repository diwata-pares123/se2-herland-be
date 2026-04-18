import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, ServiceStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    // 1. Look up the service from your dropdown options
    const service = await this.prisma.service.findFirst({
      where: { name: dto.serviceName },
    });

    if (!service) {
      throw new BadRequestException(`Service '${dto.serviceName}' not found in the database. Please make sure it exists.`);
    }

    // <-- FIX APPLIED: Use explicit status if sent, otherwise fallback to checking paymentMethod
    const currentPaymentStatus = dto.paymentStatus || (dto.paymentMethod ? PaymentStatus.PAID : PaymentStatus.UNPAID);

    // 3. Generate Invoice Number
    const invoiceString = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Save to Database using Prisma
    const newTransaction = await this.prisma.transaction.create({
      data: {
        invoiceNumber: invoiceString,
        customerName: dto.customerName,
        totalAmount: dto.amount,
        transactionDate: new Date(dto.transactionDate),
        paymentMethod: dto.paymentMethod,
        paymentStatus: currentPaymentStatus,
        serviceStatus: ServiceStatus.ON_GOING,
        
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

    return newTransaction;
  }

  async findAll() {
    // Fetch all non-deleted transactions for the Sales Report
    const transactions = await this.prisma.transaction.findMany({
      where: { isDeleted: false }, // You can leave this as-is; it won't hurt hard-deleted items
      include: {
        items: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total revenue from PAID transactions
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
      throw new NotFoundException(`Transaction #${id} not found or has been deleted.`);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    try {
      // This will automatically apply any fields sent from the frontend 
      // (like { paymentStatus: "PAID" } or { serviceStatus: "CLAIMED" })
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: id },
        data: updateTransactionDto,
        include: {
          items: { include: { service: true } }
        }
      });
      
      return updatedTransaction;
    } catch (error) {
      throw new NotFoundException(`Failed to update. Transaction #${id} not found.`);
    }
  }

  async remove(id: string) {
    try {
      // <-- FIX APPLIED: HARD DELETE
      // 1. Delete associated items first to avoid Foreign Key constraint errors
      await this.prisma.transactionItem.deleteMany({
        where: { transactionId: id },
      });

      // 2. Actually delete the Transaction from Supabase/PostgreSQL
      const deletedTransaction = await this.prisma.transaction.delete({
        where: { id: id },
      });

      return { message: `Transaction #${id} has been permanently deleted.`, id: deletedTransaction.id };
    } catch (error) {
      throw new NotFoundException(`Failed to delete. Transaction #${id} not found.`);
    }
  }
}