import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('webhook-store-auth')
export class WebhookStoreAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('public-store-token')
  async getPublicStoreAccessToken(
    @Body() { webhookStoreUrl }: { webhookStoreUrl: string },
    @Res() res: Response,
  ) {
    if (!webhookStoreUrl.endsWith('.webhook.store')) {
      throw new ForbiddenException('This webhook store is not public');
    }
    const token = await this.authService.getAccessToken(
      { canRead: true },
      webhookStoreUrl,
    );
    res.send(token);
  }

  @Post('private-store-token')
  @UseGuards(AuthGuard('jwt'))
  async getPrivateStoreAccessToken(
    @Body() { webhookStoreUrl }: { webhookStoreUrl: string },
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (!webhookStoreUrl.endsWith('.webhook.store')) {
      throw new ForbiddenException('This webhook store is not public');
    }
    if (webhookStoreUrl.endsWith('.github.webhook.store')) {
      if (`${req.user.name}.github.webhook.store` !== webhookStoreUrl) {
        throw new ForbiddenException('This webhook store is not public');
      }
    }
    const token = await this.authService.getAccessToken(
      { canRead: true },
      webhookStoreUrl,
    );
    res.send(token);
  }
}
