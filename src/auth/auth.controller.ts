import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as jose from 'node-jose';
import * as fs from 'fs';

@Controller('/auth')
export class AuthController {
  @Get('/jwks')
  async getJWKeys(@Res() res: Response) {
    const ks = fs.readFileSync('keys.json');

    const keyStore = await jose.JWK.asKeyStore(ks.toString());

    res.send(keyStore.toJSON());
  }
}
