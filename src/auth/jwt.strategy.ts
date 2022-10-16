import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwkService } from './jwk.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private publicKey: string;
  constructor(private readonly jwkService: JwkService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (_request, _jwt, done) => {
        if (this.publicKey) {
          return done(null, this.publicKey);
        }
        const publicKey = await this.jwkService.getPublicKey();
        this.publicKey = publicKey;
        return done(null, publicKey);
      },
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, name: payload.name };
  }
}
