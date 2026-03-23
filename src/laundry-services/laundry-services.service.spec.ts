import { Test, TestingModule } from '@nestjs/testing';
import { LaundryServicesService } from './laundry-services.service';

describe('LaundryServicesService', () => {
  let service: LaundryServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaundryServicesService],
    }).compile();

    service = module.get<LaundryServicesService>(LaundryServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
