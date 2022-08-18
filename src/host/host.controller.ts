import { Controller, Get, Post } from '@nestjs/common';
import { HostService } from './host.service';

@Controller('/hosts')
export class HostController {
  constructor(private readonly hostService: HostService) {}
  @Get()
  getHosts(): any {
    return this.hostService.getHost('croute.com');
  }

  @Post()
  createHost(): any {
    return this.hostService.createHostRule({
      domain: 'croute.com',
    });
  }
}
