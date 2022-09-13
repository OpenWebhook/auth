import { Injectable } from '@nestjs/common';
import { RedisService } from '../infrastructure/redis.service';
import * as jose from 'node-jose';

@Injectable()
export class JwkService {
  constructor(private readonly redisService: RedisService) {}
  public async getKeyStore(): Promise<{ keys: PublicKey[] }> {
    const keyStore = jose.JWK.createKeyStore();
    const allKeysIterator = this.redisService.client.scanIterator({
      MATCH: `${keyFileName}*`,
    });

    for await (const redisKey of allKeysIterator) {
      const ks = await this.redisService.client.get(redisKey);
      const key = await jose.JWK.asKey(ks.toString());

      await keyStore.add(key);
    }
    return keyStore.toJSON();
  }

  public async getPublicKey(): Promise<any> {
    const ks = await this.redisService.client.get(currentKey);
    const key = await jose.JWK.asKey(ks.toString());

    const publicKey = (await jose.JWK.asKey(key)).toPEM();
    return publicKey;
  }

  public async createAndStoreKey(): Promise<{
    key: PrivateJwk;
    privateKey: string;
  }> {
    const keyStore = jose.JWK.createKeyStore();
    await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });
    const publicKey = keyStore.toJSON().keys[0];
    const stringifiedKey = JSON.stringify(publicKey);

    await this.redisService.client.set(
      `${keyFileName}/${publicKey.kid}`,
      stringifiedKey,
    );
    await this.redisService.client.set(currentKey, stringifiedKey);

    const key = keyStore.toJSON(true).keys[0];
    const privateKey = (await jose.JWK.asKey(key)).toPEM(true);
    return { key, privateKey };
  }
}

type Jwk = {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
};

type PublicKey = Jwk & {
  d: undefined;
  p: undefined;
  q: undefined;
  dp: undefined;
  dq: undefined;
  qi: undefined;
};

type PrivateJwk = Jwk & {
  d: string;
  p: string;
  q: string;
  dp: string;
  dq: string;
  qi: string;
};

export const keyFileName = 'JWK';
const currentKey = 'currentJWK';
