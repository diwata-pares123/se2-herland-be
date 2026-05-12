import { IsNumber, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  @IsOptional()
  currentValue?: number; // Added ? and optional decorator
}