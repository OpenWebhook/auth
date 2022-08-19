import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import authConfiguration from './config/auth.config';
import { HostModule } from './host/host.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [authConfiguration] }),
    AuthModule,
    UsersModule,
    HostModule,
  ],
})
export class AppModule {}
