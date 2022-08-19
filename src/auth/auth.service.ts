import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(
    user: User,
    accessRights: { canRead: boolean },
    domain: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      email: user.email,
      sub: user.email,
      picture: user.picture,
      name: user.name,
      accessRights,
    };
    return {
      access_token: this.jwtService.sign(payload, { audience: domain }),
    };
  }
}
