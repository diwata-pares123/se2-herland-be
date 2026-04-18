import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsIn } from 'class-validator';
import { PaymentStatus, ServiceStatus } from '@prisma/client'; // <-- Added ServiceStatus

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  serviceName!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  transactionDate!: string;

  @IsOptional()
  @IsIn(['CASH', 'GCASH'])
  paymentMethod?: 'CASH' | 'GCASH';

  @IsOptional()
  paymentStatus?: PaymentStatus; 

  // <-- FIX: Add this so NestJS doesn't strip it out!
  @IsOptional()
  serviceStatus?: ServiceStatus; 
}