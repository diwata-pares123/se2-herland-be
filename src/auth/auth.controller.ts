import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/log-in.dto';
import { ResetPasswordDto } from '../users/dto/new-password.dto'; 
import { JwtAuthGuard } from './jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Forgot Password Route
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // Reset Password Route
  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetDto);
  }

  // Get Logged-in User Profile
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  // --- NEW: Change Password Route ---
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() body) {
    // req.user.sub is the user ID decoded from the access_token
    // body contains currentPassword and newPassword from your Frontend Modal
    return this.authService.changePassword(
      req.user.sub, 
      body.currentPassword, 
      body.newPassword
    );
  }
}