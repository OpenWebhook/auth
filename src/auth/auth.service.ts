import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getIDToken(
    user: User,
    ghOrganisations: string[],
  ): Promise<{ idToken: string }> {
    const payload = {
      email: user.email,
      picture: user.picture,
      name: user.name,
      ghOrganisations,
    };
    return {
      idToken: this.jwtService.sign(payload, {
        subject: user.email,
      }),
    };
  }

  async getAccessToken(
    accessRights: { canRead: boolean },
    domain: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      accessRights,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        audience: domain,
      }),
    };
  }
}
