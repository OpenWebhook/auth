import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { adminPassportStrategyName } from './admin.strategy';

@Injectable()
export class AdminGuard extends AuthGuard(adminPassportStrategyName) {}
