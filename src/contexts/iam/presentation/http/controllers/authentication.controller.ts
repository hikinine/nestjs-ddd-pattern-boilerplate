import { ApplicationLevelError, DomainError } from '@hiki9/rich-domain/dist';
import { AuthenticationService } from '@iam/application/service/authentication.service';
import {
  clearAuthenticateCookiesOn,
  generateAuthenticationCookiesOn,
} from '@iam/config/cookie.config';
import {
  AskForRecoveryPasswordInput,
  RecoveryPasswordInput,
  SignInInput,
  VerifyIfTokenPasswordIsValidInput,
} from '@iam/presentation/http/dto';
import { HttpExceptionFilter } from '@lib/common';
import { RefreshTokenCookieKey } from '@lib/constants/cookies';
import { Cookies } from '@lib/utils/cookie';
import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';

@ApiTags('authentication')
@Controller('/iam/authentication')
@UseFilters(HttpExceptionFilter)
export class AuthenticationController {
  constructor(private readonly service: AuthenticationService) {}

  @Post('/sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: SignInInput,
  ): Promise<void> {
    const { email, password, keepMeLoggedIn } = dto;
    try {
      const token = await this.service.signInWithBasic(
        email,
        password,
        keepMeLoggedIn,
      );
      generateAuthenticationCookiesOn(response, token);
    } catch (error) {
      clearAuthenticateCookiesOn(response);
      throw new UnauthorizedException('Usuário ou senha incorreto.');
    }
  }

  @Post('/sign-in/with-refresh-token')
  async authenticateUsingRefreshToken(
    @Request() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const cookie = Cookies.parseFromString(request.headers.cookie);
      const dtoRefreshToken = cookie.get(RefreshTokenCookieKey);
      if (!dtoRefreshToken) throw new UnauthorizedException();
      const token = await this.service.signInUsingRefreshToken(dtoRefreshToken);
      generateAuthenticationCookiesOn(response, token);
    } catch (error) {
      clearAuthenticateCookiesOn(response);
      throw new UnauthorizedException('Token de autorização indisponível.');
    }
  }

  @Post('/ask-for-recovery-password')
  async askForRecoveryPassword(@Body() dto: AskForRecoveryPasswordInput) {
    const { email } = dto;
    await this.service.askForRecoveryPassword(email);
  }

  @Post('/recovery-password')
  async recoveryPasswordThenSignIn(
    @Body() dto: RecoveryPasswordInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, password } = dto;

    try {
      const signInToken =
        await this.service.recoveryPasswordByUsingTokenThenSignIn(
          token,
          password,
        );
      generateAuthenticationCookiesOn(response, signInToken);
    } catch (error) {
      clearAuthenticateCookiesOn(response);

      if (
        error instanceof DomainError ||
        error instanceof ApplicationLevelError
      ) {
        throw error;
      } else {
        throw new UnauthorizedException('Token de recuperação inválido.');
      }
    }
  }

  @Post('/recovery-password/verify-token')
  async verifyIfRecoveryPasswordTokenIsValid(
    @Body() dto: VerifyIfTokenPasswordIsValidInput,
  ) {
    const { token } = dto;
    const response =
      await this.service.verifyIfRecoveryPasswordTokenIsValid(token);
    return response;
  }

  @Post('/sign-out')
  async SignOut(
    @Request() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies[RefreshTokenCookieKey];
      await this.service.signOut(refreshToken);
    } catch (error) {
      //
    } finally {
      clearAuthenticateCookiesOn(response);
    }
  }
}
