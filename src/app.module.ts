import { JwtVerifyConfig } from '@iam/config/jwt.config';
import { Author, AuthorUserContext } from '@lib/common';
import { AccessTokenCookieKey } from '@lib/constants/cookies';
import { AuthorContextService } from '@lib/provider';
import { Cookies } from '@lib/utils/cookie';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
//import { CustomerModule } from './contexts/customer/customer.module';
//import { SalesModule } from './contexts/sales/sales.module';
import { IamModule } from '@iam/iam.module';
import { SharedModule } from './contexts/shared/shared.module';
import { GlobalModule } from './global.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GlobalModule,
    IamModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(
    private readonly context: AuthorContextService,
    private readonly jwtService: JwtService,
  ) {}

  private extractTokenFromCookies(request: Request): string | undefined {
    const alreadyParsedCookie = request.cookies?.[AccessTokenCookieKey];
    if (alreadyParsedCookie) return alreadyParsedCookie;
    const cookie = Cookies.parseFromString(request.headers.cookie);
    return cookie.get(AccessTokenCookieKey);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const store: AuthorUserContext = {
          userAgent: req?.headers?.['user-agent'],
          author: null,
        };

        try {
          const token = this.extractTokenFromCookies(req);
          const payload = this.jwtService.verify(token, JwtVerifyConfig);
          store.author = new Author(payload);
        } catch (e) {
          //should I need be here?
        } finally {
          this.context.run(store, () => next());
        }
      })
      .forRoutes('*');
  }
}
