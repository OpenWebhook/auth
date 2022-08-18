import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserInput, UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: UserInput) {
    const storedUser = await this.usersService.findOrCreateUser(user);
    const payload = {
      email: user.email,
      sub: user.email,
      picture: user.picture,
      name: user.name,
      id: storedUser.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
