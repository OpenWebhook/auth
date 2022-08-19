import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as fs from 'fs';
import * as jose from 'node-jose';
import { OAuthController } from './oauth.controller';
import { HttpModule } from '@nestjs/axios';
import { WebhookStoreAuthController } from './webhook-store.auth.service';
import { JwtStrategy } from './jwt.strategy';

export const keyFileName = 'keys.json';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      useFactory: async (): Promise<JwtModuleOptions> => {
        const keyStore = jose.JWK.createKeyStore();
        await keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });

        fs.writeFileSync(
          keyFileName,
          JSON.stringify(keyStore.toJSON(true), null, '  '),
        );

        const key = keyStore.toJSON(true).keys[0];
        const privateKey = (await jose.JWK.asKey(key)).toPEM(true);

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
  controllers: [AuthController, WebhookStoreAuthController, OAuthController],
})
export class AuthModule {}
