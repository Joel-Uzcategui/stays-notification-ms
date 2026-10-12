import { envs } from '../config';
import type {
  BookingConfirmedEvent,
  PaymentRefundedEvent,
  UserView,
} from './events';

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);

const day = (value: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(value),
  );

const firstName = (fullName: string) => fullName.trim().split(' ')[0];

const layout = (
  lead: string,
  rows: [string, string][],
  action: string,
  href: string,
) => `
<div style="font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;max-width:520px;margin:0 auto;padding:24px">
  <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin:0 0 24px">
    Uzcategui Stays
  </p>

  <p style="font-size:16px;line-height:1.5;margin:0 0 24px">${lead}</p>

  <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 24px">
    ${rows
      .map(
        ([label, value]) => `
    <tr>
      <td style="padding:6px 0;color:#6b7280">${label}</td>
      <td style="padding:6px 0;text-align:right">${value}</td>
    </tr>`,
      )
      .join('')}
  </table>

  <a href="${href}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-size:14px;padding:10px 18px;border-radius:4px">
    ${action}
  </a>

  <p style="font-size:12px;color:#9ca3af;margin:32px 0 0">
    You are receiving this email because you have a booking with us.
  </p>
</div>
`;

export const bookingConfirmed = (
  event: BookingConfirmedEvent,
  user: UserView,
) => ({
  subject: `Your stay is confirmed for ${day(event.checkIn)}`,
  body: layout(
    `Hi ${firstName(user.fullName)}, your payment went through and your stay is confirmed.`,
    [
      ['Check-in', day(event.checkIn)],
      ['Check-out', day(event.checkOut)],
      ['Rooms', String(event.units)],
      ['Total paid', money(event.totalCents, event.currency)],
    ],
    'View your booking',
    `${envs.webUrl}/bookings/${event.bookingId}`,
  ),
});

export const paymentRefunded = (
  event: PaymentRefundedEvent,
  user: UserView,
) => ({
  subject: 'Your refund is on its way',
  body: layout(
    `Hi ${firstName(user.fullName)}, we have refunded your payment. It can take a few business days to appear on your statement.`,
    [
      ['Amount', money(event.amountCents, event.currency)],
      ['Reason', event.reason],
    ],
    'View your booking',
    `${envs.webUrl}/bookings/${event.bookingId}`,
  ),
});
