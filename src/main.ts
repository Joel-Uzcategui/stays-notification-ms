import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('NotificationMS');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [envs.rabbitmqUrl],
        queue: envs.rabbitmqQueue,
        queueOptions: { durable: true },
      },
    },
  );

  await app.listen();
  logger.log(
    `Notification microservice listening on queue "${envs.rabbitmqQueue}"`,
  );
}

void bootstrap();
