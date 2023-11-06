import { jwtConstants } from '@lib/common';

export const JwtVerifyConfig = {
  secret: jwtConstants.secret,
};

export const expiresIn = 1000 * 60 * 60;
export const JwtConfig = {
  global: true,
  signOptions: { expiresIn },
  ...JwtVerifyConfig,
};
