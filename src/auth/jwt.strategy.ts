import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as jose from 'node-jose';
import * as fs from 'fs';
import { keyFileName } from './auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private publicKey: string;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (_request, _jwt, done) => {
        if (this.publicKey) {
          return done(null, this.publicKey);
        }
        const ks = fs.readFileSync(keyFileName);
        const keyStore = await jose.JWK.asKeyStore(ks.toString());
        const key = keyStore.toJSON().keys[0];
        const publicKey = (await jose.JWK.asKey(key)).toPEM();
        this.publicKey = publicKey;
        return done(null, publicKey);
      },
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
