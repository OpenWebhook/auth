import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as jose from 'node-jose';
import { keyFileName } from './auth.module';
import { RedisService } from '../infrastructure/redis.service';

@Controller()
export class AuthController {
  constructor(private readonly redisService: RedisService) {}

  @Get('.well-known/jwks.json')
  async getJWKeys(@Res() res: Response) {
    const ks = await this.redisService.client.get(keyFileName);

    const keyStore = await jose.JWK.asKeyStore(ks.toString());

    res.send(keyStore.toJSON());
  }
}
