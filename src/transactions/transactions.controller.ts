import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // I-make sure tama ang path nito

@UseGuards(JwtAuthGuard) // Added: Para malaman kung SINO ang gumagawa ng action
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    // Ipapasa natin ang req.user.sub (User ID) sa service
    return this.transactionsService.create(req.user.sub, createTransactionDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    // Ipapasa natin ang req.user.sub (User ID) sa service
    return this.transactionsService.update(id, updateTransactionDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    // Ipapasa natin ang req.user.sub (User ID) sa service
    return this.transactionsService.remove(id, req.user.sub);
  }
}