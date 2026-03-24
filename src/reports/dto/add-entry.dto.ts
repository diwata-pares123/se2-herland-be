import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class AddEntryDto {
  @IsString()
  customerName: string; // e.g., "JUAN DE LA CRUZ"

  @IsString()
  serviceName: string; // e.g., "WASH & FOLD"

  @IsNumber()
  amount: number; // e.g., 200.00

  // Note: Your frontend should ideally send this as 'YYYY-MM-DD' (e.g., '2026-03-24')
  @IsDateString()
  transactionDate: string; 

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod; // CASH, GCASH, or CARD
}