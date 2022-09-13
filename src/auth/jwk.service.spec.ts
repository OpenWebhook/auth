/* eslint-disable @typescript-eslint/ban-ts-comment */
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

  it('should create a keystore', async () => {
    const keyStore = await jwkService.getKeyStore();
    expect(keyStore.keys).toHaveLength(0);
    await jwkService.createAndStoreKey();
    const newKeyStore = await jwkService.getKeyStore();
    expect(newKeyStore.keys).toHaveLength(1);
  });

  it('should show only public keys in the keystore', async () => {
    await jwkService.createAndStoreKey();
    const newKeyStore = await jwkService.getKeyStore();
    expect(newKeyStore.keys).toHaveLength(1);
    newKeyStore.keys.forEach((key) => {
      expect(key.kty).toBeDefined();
      expect(key.d).not.toBeDefined();
      expect(key.p).not.toBeDefined();
      expect(key.q).not.toBeDefined();
      expect(key.dp).not.toBeDefined();
      expect(key.dq).not.toBeDefined();
      expect(key.qi).not.toBeDefined();
    });
  });

  it('should return the private key when creating it', async () => {
    const { key, privateKey } = await jwkService.createAndStoreKey();
    expect(privateKey).toBeDefined();
    expect(privateKey).toMatch(/^-----BEGIN [A-Z]* PRIVATE KEY-----/);
    expect(privateKey).toMatch(/-----END [A-Z]* PRIVATE KEY-----/);

    expect(key.d).toBeDefined();
    expect(key.p).toBeDefined();
    expect(key.q).toBeDefined();
    expect(key.dp).toBeDefined();
    expect(key.dq).toBeDefined();
    expect(key.qi).toBeDefined();
  });

  it('should return the public key', async () => {
    await jwkService.createAndStoreKey();
    const publicKey = await jwkService.getPublicKey();
    expect(publicKey).toBeDefined();
    expect(publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----/);
    expect(publicKey).toMatch(/-----END PUBLIC KEY-----/);
  });

  it('should keep all the keys', async () => {
    const keyStore = await jwkService.getKeyStore();
    expect(keyStore.keys).toHaveLength(0);
    await jwkService.createAndStoreKey();
    await jwkService.createAndStoreKey();
    const newKeyStore = await jwkService.getKeyStore();
    expect(newKeyStore.keys).toHaveLength(2);
  });
});
