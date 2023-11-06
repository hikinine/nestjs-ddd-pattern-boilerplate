import {
  Author,
  AuthorContextService,
  PERMS_KEY,
  PermissionEncoded,
} from '@lib/common';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthorContextService))
    private readonly store: AuthorContextService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const contexts = [context.getHandler(), context.getClass()];
    const required = this.reflector.getAllAndOverride<PermissionEncoded[]>(
      PERMS_KEY,
      contexts,
    );

    if (!required || required.length === 0) {
      return true;
    }

    const author = this.store.getAuthor();
    if (!(author instanceof Author)) {
      throw new UnauthorizedException('No author context found');
    }
    if (!author.hasPermissions(required)) {
      throw new ForbiddenException(
        `Required permissions: ${required.join(', ')}`,
      );
    }
    return true;
  }
}
