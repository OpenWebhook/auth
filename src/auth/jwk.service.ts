import { Injectable } from '@nestjs/common';
import { RedisService } from '../infrastructure/redis.service';
import * as jose from 'node-jose';

type Jwk = {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
};

export const keyFileName = 'keys.json';

@Injectable()
export class JwkService {
  constructor(private readonly redisService: RedisService) {}
  public async getKeyStore(): Promise<{ keys: Jwk[] }> {
    try {
      const ks = await this.redisService.client.get(keyFileName);

      const keyStore = await jose.JWK.asKeyStore(ks.toString());

      return keyStore.toJSON();
    } catch (e) {
      return { keys: [] };
    }
  }

  public async getPublicKey(): Promise<any> {
    const ks = await this.redisService.client.get(keyFileName);
    const keyStore = await jose.JWK.asKeyStore(ks.toString());
    const key = keyStore.toJSON().keys[0];
    const publicKey = (await jose.JWK.asKey(key)).toPEM();
    return publicKey;
  }

  public async createAndStoreKey(): Promise<{ key: Jwk; privateKey: any }> {
    const keyStore = jose.JWK.createKeyStore();
    await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });

    await this.redisService.client.set(
      keyFileName,
      JSON.stringify(keyStore.toJSON(true)),
    );

    const key = keyStore.toJSON(true).keys[0];
    const privateKey = (await jose.JWK.asKey(key)).toPEM(true);
    return { key, privateKey };
  }
}
