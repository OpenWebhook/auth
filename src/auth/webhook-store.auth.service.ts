import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  ForbiddenException,
  Next,
  NotAcceptableException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

@Controller('webhook-store-auth')
export class WebhookStoreAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
  ) {}

  @Post('access-token')
  @UseGuards(AuthGuard('jwt'))
  async getPrivateStoreAccessToken(
    @Body() { webhookStoreUrl }: { webhookStoreUrl?: string },
    @Req() req: any,
    @Res() res: Response,
    @Next() next: any,
  ) {
    try {
      if (!webhookStoreUrl) {
        throw new NotAcceptableException('Webhook store URL is required');
      }
      if (!webhookStoreUrl.endsWith('.webhook.store')) {
        const webhookStoreAuthMetadata = await firstValueFrom(
          this.httpService.get(`https://${webhookStoreUrl}/auth-metadata`),
        );
        const githubOrgaName = webhookStoreAuthMetadata.data.ghOrg;
        if (!githubOrgaName) {
          throw new ForbiddenException('This webhook store is not public');
        }
        const userHasAccessToOrganisation = req.user.ghOrganisations.find(
          (userOrgaName: string) =>
            userOrgaName.toLocaleLowerCase() ===
            githubOrgaName.toLocaleLowerCase(),
        );
        if (!userHasAccessToOrganisation) {
          throw new ForbiddenException('This webhook store is not public');
        }
      }
      if (webhookStoreUrl.endsWith('.github.webhook.store')) {
        const githubUserName =
          webhookStoreUrl.split('.')[webhookStoreUrl.split('.').length - 4];
        if (req.user.name.toLocaleLowerCase() !== githubUserName) {
          throw new ForbiddenException('This webhook store is not public');
        }
      }
      if (webhookStoreUrl.endsWith('.github-org.webhook.store')) {
        const githubOrgaName =
          webhookStoreUrl.split('.')[webhookStoreUrl.split('.').length - 4];
        const userHasAccessToOrganisation = req.user.ghOrganisations.find(
          (userOrgaName: string) =>
            userOrgaName.toLocaleLowerCase() ===
            githubOrgaName.toLocaleLowerCase(),
        );

        if (!userHasAccessToOrganisation) {
          throw new ForbiddenException('This webhook store is not public');
        }
      }
      const token = await this.authService.getAccessToken(
        { canRead: true },
        webhookStoreUrl,
      );
      res.send(token);
    } catch (e) {
      next(e);
    }
  }
}
