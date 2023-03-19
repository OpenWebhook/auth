import { HttpService } from '@nestjs/axios';
import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Next,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { isValidHttpUrl } from 'src/utils/is-valid-url';
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
  login(@Res() res: Response, @Headers('referer') referer: string) {
    const state = encodeURIComponent(referer);
    const url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${this.authConfig.githubOauth.clientId}&state=${state}`;
    return res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Res() res: Response,
    @Next() next: any,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
  ) {
    if (!code) {
      return next(new ForbiddenException('No code provided'));
    }
    if (!state) {
      return next(new ForbiddenException('No state provided'));
    }
    const redirectUrl = decodeURI(state);
    if (!isValidHttpUrl(redirectUrl)) {
      return next(new ForbiddenException('Invalid state'));
    }
    try {
      const accessTokenResponse = await firstValueFrom(
        this.httpService.post<{
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
        ),
      );
      const githubAccessToken = accessTokenResponse.data.access_token;

      const userResponse = await firstValueFrom(
        this.httpService.get('https://api.github.com/user', {
          headers: {
            Authorization: `token ${githubAccessToken}`,
          },
        }),
      );
      const githubUsername = userResponse.data.login;
      const user = await this.usersService.findOrCreateUser({
        email:
          userResponse.data.email ||
          `${userResponse.data.login}@github.nopublicemail`,
        picture: userResponse.data.avatar_url,
        name: githubUsername,
      });

      const githubOrganisations = await firstValueFrom(
        this.httpService.get(
          `https://api.github.com/users/${githubUsername}/orgs`,
        ),
      );

      const githubOrganisationNames = githubOrganisations.data.map(
        (organisation) => {
          return organisation.login;
        },
      );

      const { idToken: access_token } = await this.authService.getIDToken(
        user,
        githubOrganisationNames,
      );
      const hostname = new URL(redirectUrl).hostname;
      const redirectToUserGithubStore = hostname === 'github.webhook.store';

      if (redirectToUserGithubStore) {
        return res.redirect(
          `https://${githubUsername}.github.webhook.store/?access_token=${access_token}`,
        );
      }
      return res.redirect(`${redirectUrl}?access_token=${access_token}`);
    } catch (error: any) {
      console.error(error);
      return next(new Error(error));
    }
  }
}
