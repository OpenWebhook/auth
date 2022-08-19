import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getIDToken(
    user: User,
    accessRights: { canRead: boolean },
    domain: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      email: user.email,
      sub: user.email,
      picture: user.picture,
      name: user.name,
      accessRights,
    };
    return {
      accessToken: this.jwtService.sign(payload, { audience: domain }),
    };
  }
}
