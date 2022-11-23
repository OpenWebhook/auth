import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OAuthController } from './oauth.controller';
import { HttpModule } from '@nestjs/axios';
import { WebhookStoreAuthController } from './webhook-store.auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwkService } from './jwk.service';
import { JwkModule } from './jwk.module';
import { WebAuthnController } from './webauthn/webauthn.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    HttpModule,
    JwkModule,
    JwtModule.registerAsync({
      imports: [JwkModule],
      inject: [JwkService],
      useFactory: async (jwkService: JwkService): Promise<JwtModuleOptions> => {
        const { key, privateKey } = await jwkService.createAndStoreKey();
        return {
          privateKey,
          signOptions: {
            algorithm: 'RS256',
            keyid: key.kid,
            issuer: 'openwebhook',
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
  controllers: [
    AuthController,
    WebhookStoreAuthController,
    OAuthController,
    WebAuthnController,
  ],
})
export class AuthModule {}
