import { Injectable } from '@nestjs/common';
import { CreateLaundryServiceDto } from './dto/create-laundry-service.dto';
import { UpdateLaundryServiceDto } from './dto/update-laundry-service.dto';

@Injectable()
export class LaundryServicesService {
  create(createLaundryServiceDto: CreateLaundryServiceDto) {
    return 'This action adds a new laundryService';
  }

  findAll() {
    return `This action returns all laundryServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} laundryService`;
  }

  update(id: number, updateLaundryServiceDto: UpdateLaundryServiceDto) {
    return `This action updates a #${id} laundryService`;
  }

  remove(id: number) {
    return `This action removes a #${id} laundryService`;
  }
}
