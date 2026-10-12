import { Provider } from '@nestjs/common';
import { createTransport } from 'nodemailer';

import { MAIL_TRANSPORT, envs } from '../config';

export const mailProvider: Provider = {
  provide: MAIL_TRANSPORT,
  useFactory: () =>
    createTransport({
      host: envs.smtpHost,
      port: envs.smtpPort,
      secure: false,
      auth: { user: envs.smtpUser, pass: envs.smtpPassword },
    }),
};
