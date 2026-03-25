import * as dotenv from 'dotenv';
// 1. Load the .env file FIRST
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// 2. Initialize the Prisma 7 Postgres Adapter using your env variable
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// 3. Pass the adapter into the Prisma Client constructor!
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting to seed database with Laundry Services...');

  const services = [
    { name: 'WASH', price: 0 },
    { name: 'DRY', price: 0 },
    { name: 'FOLD', price: 0 },
    { name: 'WASH & DRY', price: 0 },
    { name: 'WASH & FOLD', price: 0 },
    { name: 'FULL SERVICE', price: 0 },
  ];

  for (const service of services) {
    const exists = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!exists) {
      await prisma.service.create({
        data: service,
      });
      console.log(`✅ Created service: ${service.name}`);
    } else {
      console.log(`⏩ Skipped service (already exists): ${service.name}`);
    }
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });