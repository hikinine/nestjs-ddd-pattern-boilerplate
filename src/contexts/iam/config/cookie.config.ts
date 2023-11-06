import { RefreshToken } from '@iam/domain/entities';
import { SignInToken } from '@iam/domain/value-object';
import {
  AccessTokenCookieKey,
  RefreshTokenCookieKey,
} from '@lib/constants/cookies';
import { minutes } from '@lib/utils';
import { CookieOptions, Response } from 'express';

export const generateCookieConfig = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
  secure: true,
  maxAge,
});

export function generateAuthenticationCookiesOn(
  response: Response,
  token: SignInToken,
) {
  const { accessToken, refreshToken } = token.value;

  response.cookie(
    AccessTokenCookieKey,
    accessToken,
    generateCookieConfig(minutes(60)),
  );

  if (refreshToken) {
    response.cookie(
      RefreshTokenCookieKey,
      refreshToken,
      generateCookieConfig(RefreshToken.EXPIRES_AT),
    );
  }
}

export function clearAuthenticateCookiesOn(response: Response) {
  response.clearCookie(AccessTokenCookieKey);
  response.clearCookie(RefreshTokenCookieKey);
}
