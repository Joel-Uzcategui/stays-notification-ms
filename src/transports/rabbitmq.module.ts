import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AUTH_SERVICE, envs } from '../config';

const clients = ClientsModule.register([
  {
    name: AUTH_SERVICE,
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbitmqUrl],
      queue: envs.authQueue,
      queueOptions: { durable: true },
    },
  },
]);

@Module({
  imports: [clients],
  exports: [clients],
})
export class RabbitMQModule {}
