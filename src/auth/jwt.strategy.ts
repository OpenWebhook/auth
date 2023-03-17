import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwkService } from './jwk.service';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwkService: JwkService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://openwebhook-auth.herokuapp.com/.well-known/jwks.json`,
        getKeysInterceptor: async () => {
          const keys = await this.jwkService.getKeyStore();
          return keys.keys;
        },
      }),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      name: payload.name,
      ghOrganisations: payload.ghOrganisations,
    };
  }
}
