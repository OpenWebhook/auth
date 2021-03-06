import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: { email: string }) {
    const payload = { email: user.email, sub: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
