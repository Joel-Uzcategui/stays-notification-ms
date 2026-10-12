import { Module } from '@nestjs/common';

import { mailProvider } from './mail.provider';
import { MailerService } from './mailer.service';

@Module({
  providers: [mailProvider, MailerService],
  exports: [MailerService],
})
export class MailerModule {}
