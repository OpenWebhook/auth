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

  beforeEach(async () => {
    await redisService.client.flushDb();
  });

  afterAll(async () => {
    await redisService.client.disconnect();
  });

  it('should be defined', async () => {
    const keyStore = await jwkService.getKeyStore();
    expect(keyStore.keys).toHaveLength(0);
    await jwkService.createAndStoreKey();
    const newKeyStore = await jwkService.getKeyStore();
    expect(newKeyStore.keys).toHaveLength(1);
  });
});
