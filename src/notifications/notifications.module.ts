import { Module } from '@nestjs/common';

import { MailerModule } from '../mailer/mailer.module';
import { RabbitMQModule } from '../transports/rabbitmq.module';
import { DeliveryService } from './delivery.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [RabbitMQModule, MailerModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, DeliveryService],
})
export class NotificationsModule {}
