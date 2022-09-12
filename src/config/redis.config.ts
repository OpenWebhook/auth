import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  redisUrl: process.env.REDIS_TLS_URL || process.env.REDIS_URL,
}));
