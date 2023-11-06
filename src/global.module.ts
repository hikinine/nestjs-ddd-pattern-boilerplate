import { JwtConfig } from '@iam/config/jwt.config';
import { ApplicationQueueKey } from '@lib/constants';
import { AuthorContextService, EventPublisher, RmqModule } from '@lib/provider';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    RmqModule.register({ name: ApplicationQueueKey }),
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    JwtModule.register(JwtConfig),
  ],
  providers: [EventPublisher, AuthorContextService],
  exports: [AuthorContextService, CqrsModule, EventPublisher],
})
export class GlobalModule {}
