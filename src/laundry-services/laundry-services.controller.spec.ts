import { Test, TestingModule } from '@nestjs/testing';
import { LaundryServicesController } from './laundry-services.controller';
import { LaundryServicesService } from './laundry-services.service';

describe('LaundryServicesController', () => {
  let controller: LaundryServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaundryServicesController],
      providers: [LaundryServicesService],
    }).compile();

    controller = module.get<LaundryServicesController>(LaundryServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
