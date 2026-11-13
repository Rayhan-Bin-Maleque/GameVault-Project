import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  

  const config = new DocumentBuilder()
    .setTitle('GameVault API')
    .setDescription('The GameVault API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'JWT-auth',
    )
    .build();

    const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(
    `GameVault API Documentation: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
