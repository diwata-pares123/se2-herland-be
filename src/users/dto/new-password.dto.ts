// src/users/dto/reset-password.dto.ts
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Optional: forces passwords to be at least 6 characters
  newPassword: string;
}