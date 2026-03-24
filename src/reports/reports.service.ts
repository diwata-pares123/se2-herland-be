import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddEntryDto } from './dto/add-entry.dto';
import { PaymentStatus, ServiceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createEntry(dto: AddEntryDto) {
    // 1. Look up the service from your dropdown options
    const service = await this.prisma.service.findFirst({
      where: { name: dto.serviceName },
    });

    if (!service) {
      throw new BadRequestException(`Service '${dto.serviceName}' not found in the database. Please make sure it exists.`);
    }

    // 2. Set Payment Status (If they picked Cash/GCash/Card, it is PAID)
    const currentPaymentStatus = dto.paymentMethod ? PaymentStatus.PAID : PaymentStatus.UNPAID;

    // 3. Generate a quick unique Invoice Number (e.g., INV-837492)
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
        serviceStatus: ServiceStatus.ON_GOING, // Default status for new entries
        
        // This links the specific service to the transaction
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
      // Return the created data along with the service details
      include: {
        items: {
          include: { service: true }
        }
      }
    });

    return newTransaction;
  }
}