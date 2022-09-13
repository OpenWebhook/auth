import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwkService } from './jwk.service';

@Controller()
export class AuthController {
  constructor(private readonly jwkService: JwkService) {}

  @Get('.well-known/jwks.json')
  async getJWKeys(@Res() res: Response) {
    const keyStore = await this.jwkService.getKeyStore();
    res.send(keyStore);
  }
}
