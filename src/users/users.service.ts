import { Injectable } from '@nestjs/common';

export type User = {
  email: string;
  picture: string | null;
  name: string | null;
  password?: string;
};

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      name: 'john',
      password: 'changeme',
      email: 'email',
      picture: 'croute.fr/picture',
    },
    {
      userId: 2,
      name: 'maria',
      password: 'guess',
      email: 'email',
      picture: 'croute.fr/picture',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.name === username);
  }

  async findOrCreateUser(user: User): Promise<User> {
    return user;
  }
}
