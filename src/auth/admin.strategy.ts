import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import authConfig from '../config/auth.config';

export const adminPassportStrategyName = 'admin-basic';

@Injectable()
export class AdminStrategy extends PassportStrategy(
  BasicStrategy,
  adminPassportStrategyName,
) {
  private readonly adminPassword: string | undefined;
  constructor(configService: ConfigService) {
    super();
    const config: ConfigType<typeof authConfig> = configService.get('auth');
    this.adminPassword = config.adminPassword;
  }

  async validate(username: string, password: string): Promise<any> {
    if (this.adminPassword === undefined) {
      throw new ForbiddenException('Admin password is not defined in config');
    }
    if (username === 'admin' && password === this.adminPassword) {
      return { user: 'admin' };
    }
    throw new ForbiddenException('Invalid admin credentials');
  }
}
