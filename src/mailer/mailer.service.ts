import { Inject, Injectable } from '@nestjs/common';
import type { Transporter } from 'nodemailer';

import { MAIL_TRANSPORT, envs } from '../config';

@Injectable()
export class MailerService {
  constructor(
    @Inject(MAIL_TRANSPORT) private readonly transport: Transporter,
  ) {}

  async send(to: string, subject: string, html: string) {
    const info = (await this.transport.sendMail({
      from: `"${envs.mailFromName}" <${envs.mailFrom}>`,
      to,
      subject,
      html,
    })) as { messageId: string };

    return info.messageId;
  }
}
