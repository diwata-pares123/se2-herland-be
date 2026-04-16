import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // 1. Grab the URL from your .env
    const connectionString = process.env.DATABASE_URL;
    
    // 2. Create a standard Postgres connection pool
    const pool = new Pool({ connectionString });
    
    // 3. Wrap it in the Prisma 7 Adapter
    const adapter = new PrismaPg(pool as any);
    
    // 4. Pass ONLY the adapter to the PrismaClient!
    super({ adapter }); 
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('🚀 SUCCESS: Database connected via Prisma 7 Adapter!');
    } catch (err) {
      // FIX: Tell TypeScript to treat 'err' as a standard Error object
      console.error('❌ CONNECTION ERROR:', (err as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}