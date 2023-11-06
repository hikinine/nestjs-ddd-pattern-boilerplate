import { AuthenticationService } from '@iam/application/service';
import {
  clearAuthenticateCookiesOn,
  generateAuthenticationCookiesOn,
} from '@iam/config/cookie.config';
import { JwtVerifyConfig } from '@iam/config/jwt.config';
import {
  Author,
  AuthorContextService,
  AuthorProps,
  DISABLED_CONTROLLER_KEY,
  IS_PUBLIC_KEY,
} from '@lib/common';
import {
  AccessTokenCookieKey,
  RefreshTokenCookieKey,
} from '@lib/constants/cookies';
import { Cookies } from '@lib/utils/cookie';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  MethodNotAllowedException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthenticateGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthorContextService))
    private readonly authorService: AuthorContextService,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.stopIfThisMethodIsDisabled(context);

    const isPublicRoute = this.isPublic(context);
    const store = this.authorService.getStore();

    if (isPublicRoute || this.isAlreadySigned(store.author)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token =
      this.extractTokenFromCookies(AccessTokenCookieKey, request) ||
      this.extractTokenFromCookies(RefreshTokenCookieKey, request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, JwtVerifyConfig);
      store.author = new Author(payload);
      return true;
    } catch (error) {
      const response = context.switchToHttp().getResponse();
      const refreshToken = this.extractTokenFromCookies(
        RefreshTokenCookieKey,
        request,
      );

      if (!refreshToken) {
        clearAuthenticateCookiesOn(response);
        throw new UnauthorizedException('No refresh token provided');
      }

      await this.authenticationService
        .signInUsingRefreshToken(refreshToken)
        .then(async (token) => {
          const { accessToken } = token.value;
          const payload = this.jwtService.decode(accessToken);
          store.author = new Author(payload as AuthorProps);
          generateAuthenticationCookiesOn(response, token);
        })
        .catch(() => {
          clearAuthenticateCookiesOn(response);
          throw new UnauthorizedException('Invalid refresh token');
        });

      return true;
    }
  }

  private extractTokenFromCookies(
    key: string,
    request: Request,
  ): string | undefined {
    const alreadyParsedCookie = request.cookies?.[key];
    if (alreadyParsedCookie) return alreadyParsedCookie;
    const rawCookie = request.headers.cookie;
    if (!rawCookie) return;
    const cookie = Cookies.parseFromString(rawCookie);
    return cookie.get(key);
  }

  private isPublic(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return Boolean(isPublic);
  }

  private isAlreadySigned(author: Author): boolean {
    return author instanceof Author;
  }

  private stopIfThisMethodIsDisabled(context: ExecutionContext): void {
    const method = this.reflector.getAllAndOverride(DISABLED_CONTROLLER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!method) return;

    if (method.disabled) {
      throw new MethodNotAllowedException(
        method.message || 'Esse método está temporariamente desabilitado.',
      );
    }
  }
}
