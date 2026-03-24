import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // NEW: Import the JWT Module
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // NEW: Register the JWT Module so NestJS knows how to create tokens
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'fallback-secret-key-for-dev', 
      signOptions: { expiresIn: '1d' }, // Tokens will expire after 1 day
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}