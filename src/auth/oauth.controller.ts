import { HttpService } from '@nestjs/axios';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import authConfig from '../config/auth.config';
import { AuthService } from './auth.service';

// @TODO: Use passportjs instead of implementing manually
@Controller('oauth')
export class OAuthController {
  private authConfig: ConfigType<typeof authConfig>;
  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    this.authConfig = configService.get('auth');
  }

  @Get('login')
  login(@Res() res: Response) {
    const url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${this.authConfig.githubOauth.clientId}`;
    return res.redirect(url);
  }

  @Get('callback')
  async callback(@Res() res: Response, @Query('code') code) {
    this.httpService
      .post<{
        access_token: string;
        token_type: string;
        scope: string;
      }>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: this.authConfig.githubOauth.clientId,
          client_secret: this.authConfig.githubOauth.clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      .subscribe((result) => {
        const githubAccessToken = result.data.access_token;

        // @TODO: Those observable should not be nested
        this.httpService
          .get('https://api.github.com/user', {
            headers: {
              Authorization: `token ${githubAccessToken}`,
            },
          })
          .subscribe(async (result) => {
            const user = await this.usersService.findOrCreateUser(
              result.data.email,
            );
            const { access_token } = await this.authService.login(user);
            // @TODO return to the right webhook.store domain
            return res.redirect(
              `https://coucou.webhook.store?access_token=${access_token}`,
            );
          });
      });
  }
}
