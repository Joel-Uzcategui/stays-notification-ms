import { Injectable, Logger } from '@nestjs/common';

import { NotificationType, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryService } from './delivery.service';
import type { BookingConfirmedEvent, PaymentRefundedEvent } from './events';

const isDuplicateKey = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === 'P2002';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly delivery: DeliveryService,
  ) {}

  onBookingConfirmed(event: BookingConfirmedEvent) {
    return this.record(
      `booking.confirmed:${event.bookingId}`,
      event.userId,
      'booking_confirmed',
      event,
    );
  }

  onPaymentRefunded(event: PaymentRefundedEvent) {
    return this.record(
      `payment.refunded:${event.paymentId}`,
      event.userId,
      'payment_refunded',
      event,
    );
  }

  private async record(
    eventId: string,
    userId: string,
    type: NotificationType,
    event: BookingConfirmedEvent | PaymentRefundedEvent,
  ) {
    const payload = event as unknown as Prisma.InputJsonObject;
    let notification;

    try {
      notification = await this.prisma.$transaction(async (tx) => {
        await tx.processedEvent.create({ data: { id: eventId } });

        return tx.notification.create({ data: { userId, type, payload } });
      });
    } catch (error) {
      if (!isDuplicateKey(error)) {
        throw error;
      }

      this.logger.log(`Event ${eventId} was already processed`);

      return;
    }

    await this.delivery.deliver(notification);
  }
}
