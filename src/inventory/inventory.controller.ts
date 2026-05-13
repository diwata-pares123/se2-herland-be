import { Controller, Get, Body, Patch, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto'; // <-- Added this import

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // NEW: POST http://localhost:3000/inventory
  // Dito dadaan ang Postman request mo para mag-add ng item
  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  // GET: http://localhost:3000/inventory
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  // PATCH: http://localhost:3000/inventory/:id/restock
  @Patch(':id/restock')
  restockItem(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.restockItem(id, dto);
  }

  // POST: http://localhost:3000/inventory/restock-all-low
  @Post('restock-all-low')
  restockAllLow() {
    return this.inventoryService.restockAllLow();
  }
}