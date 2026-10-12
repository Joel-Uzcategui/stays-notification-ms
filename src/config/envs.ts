import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  DATABASE_URL: string;
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE: string;
  AUTH_QUEUE: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  MAIL_FROM: string;
  MAIL_FROM_NAME: string;
  WEB_URL: string;
  MAX_DELIVERY_ATTEMPTS: number;
}

const envsSchema = joi
  .object({
    DATABASE_URL: joi.string().required(),
    RABBITMQ_URL: joi.string().required(),
    RABBITMQ_QUEUE: joi.string().required(),
    AUTH_QUEUE: joi.string().required(),
    SMTP_HOST: joi.string().default('smtp-relay.brevo.com'),
    SMTP_PORT: joi.number().integer().default(587),
    SMTP_USER: joi.string().required(),
    SMTP_PASSWORD: joi.string().required(),
    MAIL_FROM: joi.string().email().required(),
    MAIL_FROM_NAME: joi.string().default('Uzcategui Stays'),
    WEB_URL: joi.string().uri().required(),
    MAX_DELIVERY_ATTEMPTS: joi.number().integer().min(1).default(5),
  })
  .unknown(true);

const result = envsSchema.validate(process.env) as {
  error?: joi.ValidationError;
  value: EnvVars;
};

if (result.error) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

const envVars = result.value;

export const envs = {
  databaseUrl: envVars.DATABASE_URL,
  rabbitmqUrl: envVars.RABBITMQ_URL,
  rabbitmqQueue: envVars.RABBITMQ_QUEUE,
  authQueue: envVars.AUTH_QUEUE,
  smtpHost: envVars.SMTP_HOST,
  smtpPort: envVars.SMTP_PORT,
  smtpUser: envVars.SMTP_USER,
  smtpPassword: envVars.SMTP_PASSWORD,
  mailFrom: envVars.MAIL_FROM,
  mailFromName: envVars.MAIL_FROM_NAME,
  webUrl: envVars.WEB_URL,
  maxDeliveryAttempts: envVars.MAX_DELIVERY_ATTEMPTS,
};
