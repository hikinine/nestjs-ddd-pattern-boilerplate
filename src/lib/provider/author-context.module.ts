import { Module } from '@nestjs/common';
import { AuthorContextService } from './author-context.service';

@Module({
  providers: [AuthorContextService],
  exports: [AuthorContextService],
})
export class AuthorContextModule {}
