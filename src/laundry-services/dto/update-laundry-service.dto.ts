import { PartialType } from '@nestjs/mapped-types';
import { CreateLaundryServiceDto } from './create-laundry-service.dto';

export class UpdateLaundryServiceDto extends PartialType(CreateLaundryServiceDto) {}
