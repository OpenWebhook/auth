import { Controller, Get, Req, Res } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Request, Response } from 'express';
import authConfig from '../config/auth.config';

console.log('http://localhost:9000/oauth/login');

@Controller('oauth')
export class OAuthController {
  private authConfig: ConfigType<typeof authConfig>;
  constructor(configService: ConfigService) {
    this.authConfig = configService.get('auth');
  }

  @Get('login')
  login(@Res() res: Response) {
    const url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${this.authConfig.githubOauth.clientId}`;
    return res.redirect(url);
  }

  @Get('callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    // Find or Create user
    // Add store from req.state to user
    // redirect user to store with token set
    console.log(typeof req);
    console.log(typeof res);
    return res.sendStatus(200);
  }
}
