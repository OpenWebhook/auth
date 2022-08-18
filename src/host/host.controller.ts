import { Body, Controller, Get, Post } from '@nestjs/common';
import { HostService } from './host.service';

@Controller('/hosts')
export class HostController {
  constructor(private readonly hostService: HostService) {}
  @Get()
  getHosts(): any {
    return this.hostService.getHost('croute.com');
  }

  @Post()
  allowUserOnHost(@Body() body: any): any {
    const { domain, userEmail } = body;
    return this.hostService.findOrCreateHostUser(domain, userEmail);
  }
}
