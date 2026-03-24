import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // NEW: This makes Prisma available everywhere so you never get this error again!
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // NEW: This is the magic line that shares it with AuthModule
})
export class PrismaModule {}