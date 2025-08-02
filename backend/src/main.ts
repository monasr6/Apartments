import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ApartmentsService } from './apartments/apartments.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [`http://${process.env.DOMAIN}:3000`, 'http://frontend:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://${process.env.DOMAIN}:${port}`);

  // Seed database in development
  if (process.env.NODE_ENV === 'development') {
    const apartmentsService = app.get(ApartmentsService);
    await apartmentsService.seedDatabase();
    console.log('Database seeded with sample data');
  }
}
bootstrap();
