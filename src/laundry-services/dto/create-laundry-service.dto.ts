import { IsString, IsNumber } from 'class-validator';

export class CreateLaundryServiceDto {
  @IsString()
  name!: string;

  @IsNumber()
  price!: number;
}