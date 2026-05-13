// src/inventory/dto/create-inventory.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  currentValue!: number;

  @IsNumber()
  @IsNotEmpty()
  maxValue!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;
}