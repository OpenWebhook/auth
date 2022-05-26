import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import * as fs from 'fs';
import * as jose from 'node-jose';
import { OAuthController } from './oauth.controller';

export const keyFileName = 'keys.json';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
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
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
  controllers: [AuthController, OAuthController],
})
export class AuthModule {}
