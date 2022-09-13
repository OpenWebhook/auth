import { Test } from '@nestjs/testing';
import { RedisModule } from '../infrastructure/redis.module';
import { RedisService } from '../infrastructure/redis.service';
import { JwkModule } from './jwk.module';
import { JwkService } from './jwk.service';

describe('JwkService', () => {
  let redisService: RedisService;
  let jwkService: JwkService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwkModule, RedisModule],
      providers: [JwkService],
    }).compile();

    jwkService = moduleRef.get<JwkService>(JwkService);
    redisService = moduleRef.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await redisService.client.disconnect();
  });

  it('should be defined', async () => {
    await jwkService.createAndStoreKey();
    expect(jwkService).toBeDefined();
  });
});
