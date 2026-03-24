import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/log-in.dto';
import { ResetPasswordDto } from '../users/dto/new-password.dto'; // <-- NEW IMPORT
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // --- 1. SIGN UP (No 2FA Setup Here) ---
  async signUp(createUserDto: CreateUserDto) {
    const { email, password, name, location, phone, role } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        location,
        phone,
        role,
        isTwoFactorEnabled: true, // Default to true based on your UI requirements
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  // --- 2. LOG IN (Email/Phone OTP Flow) ---
  async login(loginDto: LoginDto) {
    const { email, password, code } = loginDto;

    // 1. Find the user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // 2. Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // 3. 2FA Check: If no code is provided, generate one
    if (user.isTwoFactorEnabled && !code) {
      // Generate a random 6-digit number
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // SAVE TO DATABASE: We use await to ensure it is NOT null when you check the DB
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: otpCode }, 
      });

      // MOCK SENDING: Check your terminal for this!
      console.log(`\n---------------------------------------------------`);
      console.log(`✉️  [OTP SENT] To: ${user.email} | Code: [ ${otpCode} ]`);
      console.log(`---------------------------------------------------\n`);

      return { 
        message: '2FA_REQUIRED', 
        email: user.email, 
        phone: user.phone 
      };
    }

    // 4. 2FA Verification: If a code IS provided, compare it
    if (user.isTwoFactorEnabled && code) {
      // Check if code matches OR if the code in DB is already gone
      if (!user.twoFactorSecret || code !== user.twoFactorSecret) {
        throw new UnauthorizedException('Invalid or expired 2FA code.');
      }

      // SUCCESS: Clear the code from DB so it can't be used again
      await this.prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: null },
      });
    }

    // 5. Issue JWT Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      message: 'Login successful',
    };
  }

  // --- NEW: FORGOT PASSWORD (Generate Reset Code) ---
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Code expires in 15 mins

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: expires,
      },
    });

    console.log(`\n---------------------------------------------------`);
    console.log(`🔑 [PASSWORD RESET] To: ${user.email} | Code: [ ${resetCode} ]`);
    console.log(`---------------------------------------------------\n`);

    return { message: 'Reset code sent successfully' };
  }

  // --- NEW: RESET PASSWORD (Verify Code & Update Password) ---
  // Changed 'any' to ResetPasswordDto
  async resetPassword(resetDto: ResetPasswordDto) {
    const { email, code, newPassword } = resetDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.resetPasswordToken || user.resetPasswordToken !== code) {
      throw new UnauthorizedException('Invalid reset code');
    }

    // UPDATED LINE: Check if expires exists AND if it's in the past
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      throw new UnauthorizedException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password reset successful' };
  }
}