import { Injectable } from '@nestjs/common';
import { Host } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma.service';

@Injectable()
export class HostService {
  constructor(private readonly prismaService: PrismaService) {}

  getHost(domain: Host['domain']): Promise<Host> {
    return this.prismaService.host.findUnique({ where: { domain } });
  }

  createHostRule(host: Host): Promise<Host> {
    return this.prismaService.host.create({ data: host });
  }
}
