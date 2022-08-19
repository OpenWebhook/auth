import { Injectable } from '@nestjs/common';
import { Host, User, HostUser } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma.service';

@Injectable()
export class HostService {
  constructor(private readonly prismaService: PrismaService) {}

  getHost(domain: Host['domain']): Promise<Host> {
    return this.prismaService.host.findUnique({ where: { domain } });
  }

  async findOrCreate(domain: Host['domain']): Promise<Host> {
    const existingHost = await this.prismaService.host.findUnique({
      where: { domain },
    });
    if (existingHost) {
      return existingHost;
    }
    const storedHost = await this.prismaService.host.create({
      data: { domain },
    });
    return storedHost;
  }

  async findOrCreateHostUser(
    hostDomain: Host['domain'],
    userEmail: User['email'],
  ): Promise<HostUser> {
    const existingUserHost = await this.prismaService.hostUser.findUnique({
      where: { userEmail_hostDomain: { hostDomain, userEmail } },
    });
    if (existingUserHost) {
      return existingUserHost;
    }
    const host = await this.findOrCreate(hostDomain);
    return this.prismaService.hostUser.create({
      data: { userEmail, hostDomain: host.domain, assignedAt: new Date() },
    });
  }

  async getHostsOfUser(
    userEmail: User['email'],
    domain: Host['domain'],
  ): Promise<{ canRead: boolean }> {
    const userHosts = await this.prismaService.host.findFirst({
      where: { AND: [{ Users: { some: { userEmail } } }, { domain }] },
    });
    if (userHosts) {
      return { canRead: true };
    }
    return { canRead: false };
  }
}
