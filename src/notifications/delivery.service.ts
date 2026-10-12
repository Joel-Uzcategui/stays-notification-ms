import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';

import { reasonOf } from '../common/reason';
import { AUTH_SERVICE, envs } from '../config';
import { Notification } from '../generated/prisma/client';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import type {
  BookingConfirmedEvent,
  PaymentRefundedEvent,
  UserView,
} from './events';
import { bookingConfirmed, paymentRefunded } from './templates';

const BATCH = 50;
const TRANSACTION_TIMEOUT = 60_000;

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Cron('*/30 * * * * *')
  async retryPending() {
    await this.prisma.$transaction(
      async (tx) => {
        const claimed = await tx.$queryRaw<{ id: string }[]>`
          SELECT id FROM notifications
          WHERE status IN ('pending', 'failed')
            AND attempts < ${envs.maxDeliveryAttempts}
          ORDER BY created_at ASC
          LIMIT ${BATCH}
          FOR UPDATE SKIP LOCKED
        `;

        if (claimed.length === 0) {
          return;
        }

        const pending = await tx.notification.findMany({
          where: { id: { in: claimed.map((row) => row.id) } },
          orderBy: { createdAt: 'asc' },
        });

        for (const notification of pending) {
          await this.deliver(notification);
        }
      },
      { timeout: TRANSACTION_TIMEOUT },
    );
  }

  async deliver(notification: Notification) {
    try {
      const letter = await this.prepare(notification);
      const providerId = await this.mailer.send(
        letter.email,
        letter.subject,
        letter.body,
      );

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'sent',
          providerId,
          sentAt: new Date(),
          attempts: { increment: 1 },
          lastError: null,
        },
      });

      this.logger.log(`Sent ${notification.type} to ${letter.email}`);
    } catch (error) {
      const reason = reasonOf(error);
      const attempts = notification.attempts + 1;

      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'failed', attempts, lastError: reason },
      });

      if (attempts >= envs.maxDeliveryAttempts) {
        this.logger.error(
          `Giving up on ${notification.id} after ${attempts} attempts: ${reason}`,
        );

        return;
      }

      this.logger.warn(`Could not send ${notification.id}: ${reason}`);
    }
  }

  private async prepare(notification: Notification) {
    if (notification.email && notification.subject && notification.body) {
      return {
        email: notification.email,
        subject: notification.subject,
        body: notification.body,
      };
    }

    const user = await this.fetchUser(notification.userId);
    const letter = { email: user.email, ...this.render(notification, user) };

    await this.prisma.notification.update({
      where: { id: notification.id },
      data: letter,
    });

    return letter;
  }

  private render(notification: Notification, user: UserView) {
    if (notification.type === 'booking_confirmed') {
      return bookingConfirmed(
        notification.payload as unknown as BookingConfirmedEvent,
        user,
      );
    }

    return paymentRefunded(
      notification.payload as unknown as PaymentRefundedEvent,
      user,
    );
  }

  private fetchUser(userId: string) {
    return firstValueFrom(this.authClient.send<UserView>('auth.me', userId));
  }
}
