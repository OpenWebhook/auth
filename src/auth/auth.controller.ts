import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as jose from 'node-jose';
import * as fs from 'fs';
import { keyFileName } from './auth.module';

@Controller('/auth')
export class AuthController {
  @Get('.well-known/jwks.json')
  async getJWKeys(@Res() res: Response) {
    const ks = fs.readFileSync(keyFileName);

    const keyStore = await jose.JWK.asKeyStore(ks.toString());

    res.send(keyStore.toJSON());
  }
}
