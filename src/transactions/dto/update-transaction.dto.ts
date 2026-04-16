import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';
import { PaymentStatus, ServiceStatus } from '@prisma/client';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(ServiceStatus)
  serviceStatus?: ServiceStatus;
}