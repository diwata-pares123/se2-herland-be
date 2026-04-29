import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Manually load .env para mabasa ang mga variables
dotenv.config();

export default defineConfig({
  datasource: {
    // Dito natin ibibigay ang DIRECT_URL para makapasok ang 'db push' sa Supabase
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});