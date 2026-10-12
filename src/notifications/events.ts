export interface BookingConfirmedEvent {
  bookingId: string;
  userId: string;
  paymentId: string;
  checkIn: string;
  checkOut: string;
  units: number;
  totalCents: number;
  currency: string;
}

export interface PaymentRefundedEvent {
  paymentId: string;
  bookingId: string;
  userId: string;
  amountCents: number;
  currency: string;
  reason: string;
}

export interface UserView {
  id: string;
  email: string;
  fullName: string;
}
