import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import redisConfiguration from '../config/redis.config';
import { RedisService } from './redis.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [redisConfiguration] })],
  providers: [
    {
      inject: [ConfigService],
      provide: RedisService,
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        const options = { url: redisConfig.redisUrl };
        const client = createClient(options);
        await client.connect();
        return { client };
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
