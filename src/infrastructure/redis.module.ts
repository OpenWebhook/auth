import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, RedisClientOptions } from 'redis';
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
        const options: RedisClientOptions = {
          url: redisConfig.redisUrl,
          database: redisConfig.redisDatabase,
        };
        const client = createClient(options);
        client.on('error', (err) => {
          console.error('Error ' + err);
        });
        await client.connect();
        return { client };
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
