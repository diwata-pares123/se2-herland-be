import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLaundryServiceDto } from './dto/create-laundry-service.dto';
import { UpdateLaundryServiceDto } from './dto/update-laundry-service.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LaundryServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLaundryServiceDto) {
    return await this.prisma.service.create({
      data: {
        name: dto.name,
        price: dto.price,
      },
    });
  }

  async findAll() {
    // We return them in alphabetical order so the frontend dropdown is organized
    return await this.prisma.service.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: id }
    });

    if (!service) {
      throw new NotFoundException(`Service #${id} not found`);
    }

    return service;
  }

  async update(id: string, dto: UpdateLaundryServiceDto) {
    try {
      return await this.prisma.service.update({
        where: { id: id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException(`Failed to update. Service #${id} not found.`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.service.delete({
        where: { id: id },
      });
    } catch (error) {
      throw new NotFoundException(`Failed to delete. Service #${id} might be linked to existing transactions.`);
    }
  }
}