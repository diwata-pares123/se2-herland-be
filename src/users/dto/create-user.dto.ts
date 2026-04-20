import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string; // <-- Nilagyan natin ng '!'

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string; // <-- Nilagyan natin ng '!'

  @IsString()
  @IsNotEmpty()
  name!: string; // <-- Nilagyan natin ng '!'

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be either ADMIN or STAFF' })
  role?: Role;
}