import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@prisma/client';

export type UserInput = { email: string; name: string; picture: string };

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findOrCreateUser(user: {
    email: string;
    name: string;
    picture: string;
  }): Promise<User> {
    const storedUser = await this.findOne(user.email);
    if (storedUser) {
      return storedUser;
    }
    const createdUser = await this.prismaService.user.create({
      data: { ...user },
    });
    return createdUser;
  }
}
