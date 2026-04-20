import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  // Optional because the frontend won't have the code on the very first request
  @IsOptional()
  @IsString()
  code?: string; 
}