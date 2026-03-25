import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;

  // 1. @IsOptional() allows the frontend to skip this for UNPAID entries
  // 2. @IsIn() strictly limits it to CASH or GCASH (CARD is officially gone!)
  @IsOptional()
  @IsIn(['CASH', 'GCASH'])
  paymentMethod?: 'CASH' | 'GCASH';
}