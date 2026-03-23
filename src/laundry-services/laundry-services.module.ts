import { Module } from '@nestjs/common';
import { LaundryServicesService } from './laundry-services.service';
import { LaundryServicesController } from './laundry-services.controller';

@Module({
  controllers: [LaundryServicesController],
  providers: [LaundryServicesService],
})
export class LaundryServicesModule {}
