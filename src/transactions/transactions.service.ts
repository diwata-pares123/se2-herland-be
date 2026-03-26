import { Injectable, BadRequestException } from '@nestjs/common';
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

    // 2. Set Payment Status automatically
    const currentPaymentStatus = dto.paymentMethod ? PaymentStatus.PAID : PaymentStatus.UNPAID;

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
      where: { isDeleted: false },
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

  findOne(id: string) {
    return `This action returns a #${id} transaction`;
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: string) {
    return `This action removes a #${id} transaction`;
  }
}