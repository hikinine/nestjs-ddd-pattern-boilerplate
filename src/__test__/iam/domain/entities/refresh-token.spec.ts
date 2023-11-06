import { RefreshToken, RefreshTokenProps } from '@iam/domain/entities';
import { minutes } from '@lib/utils';

describe('refresh-token entity', () => {
  let refreshTokenProps: RefreshTokenProps;
  beforeEach(() => {
    refreshTokenProps = {
      expiresAt: new Date(Date.now() + minutes(60)),
      token: RefreshToken.generateRandomToken(),
    };
  });

  describe('refresh-token entity basics', () => {
    it('should be defined', () => {
      expect(RefreshToken).toBeTruthy();
    });

    it('should generate random token', () => {
      const id = RefreshToken.generateRandomToken();
      expect(typeof id).toEqual('string');
    });

    it('should create an valid refresh token', () => {
      const refreshToken = new RefreshToken(refreshTokenProps);
      expect(refreshToken).toBeInstanceOf(RefreshToken);
    });

    it('should ensure that every type matchs with expected', () => {
      const refreshToken = new RefreshToken(refreshTokenProps);
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
      expect(typeof refreshToken.token).toEqual('string');

      expect(
        typeof refreshToken.userAgent === 'string' ||
          typeof refreshToken.userAgent === 'undefined',
      ).toBeTruthy();
    });
  });

  describe('refresh-token entity change methods', () => {
    it('should revoke token', async () => {
      const refreshToken = new RefreshToken(refreshTokenProps);
      refreshToken.revoke();

      expect(refreshToken.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it('should renew token', () => {
      const refreshToken = new RefreshToken(refreshTokenProps);
      const oldToken = refreshToken.token;
      const newToken = refreshToken.renewAndRefreshTheToken();
      expect(refreshToken.token).toEqual(newToken);
      expect(refreshToken.token).not.toEqual(oldToken);
      expect(refreshToken.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should check if token is valid', () => {
      const refreshToken = new RefreshToken(refreshTokenProps);
      expect(refreshToken.isValid()).toBeTruthy();
      refreshToken.revoke();
      expect(refreshToken.isValid()).toBeFalsy();
    });
  });
});
