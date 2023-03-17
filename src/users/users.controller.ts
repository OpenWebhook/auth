import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from './users.service';

@Controller('/users')
@UseGuards(AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('')
  getNumberOfUser() {
    return this.usersService.findMany();
  }
}
