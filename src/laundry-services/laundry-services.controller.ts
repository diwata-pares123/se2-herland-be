import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LaundryServicesService } from './laundry-services.service';
import { CreateLaundryServiceDto } from './dto/create-laundry-service.dto';
import { UpdateLaundryServiceDto } from './dto/update-laundry-service.dto';

@Controller('laundry-services')
export class LaundryServicesController {
  constructor(private readonly laundryServicesService: LaundryServicesService) {}

  @Post()
  create(@Body() createLaundryServiceDto: CreateLaundryServiceDto) {
    return this.laundryServicesService.create(createLaundryServiceDto);
  }

  @Get()
  findAll() {
    return this.laundryServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laundryServicesService.findOne(id); // <-- Removed the +
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLaundryServiceDto: UpdateLaundryServiceDto) {
    return this.laundryServicesService.update(id, updateLaundryServiceDto); // <-- Removed the +
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.laundryServicesService.remove(id); // <-- Removed the +
  }
}