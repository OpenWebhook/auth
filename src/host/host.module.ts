import { Module } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma.service';
import { HostController } from './host.controller';
import { HostService } from './host.service';

@Module({
  controllers: [HostController],
  providers: [HostService, PrismaService],
  exports: [HostService],
})
export class HostModule {}
