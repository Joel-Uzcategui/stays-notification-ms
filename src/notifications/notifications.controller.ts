import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import type { BookingConfirmedEvent, PaymentRefundedEvent } from './events';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @EventPattern('booking.confirmed')
  bookingConfirmed(@Payload() event: BookingConfirmedEvent) {
    return this.notifications.onBookingConfirmed(event);
  }

  @EventPattern('payment.refunded')
  paymentRefunded(@Payload() event: PaymentRefundedEvent) {
    return this.notifications.onPaymentRefunded(event);
  }
}
