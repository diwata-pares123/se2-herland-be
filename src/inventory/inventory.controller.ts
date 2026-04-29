import { Controller, Get, Body, Patch, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // GET: http://localhost:3000/inventory
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  // PATCH: http://localhost:3000/inventory/:id/restock
  // Body: { "currentValue": 20 }
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