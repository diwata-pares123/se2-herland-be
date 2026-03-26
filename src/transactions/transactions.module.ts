import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module'; // <-- Add this import

@Module({
  imports: [PrismaModule], // <-- Add PrismaModule here
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}