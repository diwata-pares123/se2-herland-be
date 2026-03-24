import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // ADD THIS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ADD THIS LINE to activate your DTOs globally
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();