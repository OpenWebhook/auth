import { Module } from '@nestjs/common';
import { RedisModule } from '../infrastructure/redis.module';
import { JwkService } from './jwk.service';

@Module({
  imports: [RedisModule],
  providers: [JwkService],
  exports: [JwkService],
})
export class JwkModule {}
