import { SignInToken } from '@iam/domain/value-object';

describe('vo sign-in-token', () => {
  const validAccessToken = 'access-token';
  const validRefreshToken = 'refresh-token';
  it('should be defined', () => {
    expect(SignInToken).toBeDefined();
  });

  it('should create a valid sign-in-token', () => {
    const signToken = new SignInToken({
      accessToken: validAccessToken,
    });

    expect(signToken).toBeInstanceOf(SignInToken);
    expect(signToken.value.accessToken).toEqual(validAccessToken);
    expect(signToken.value.refreshToken).not.toBeDefined();
  });

  it('should create a valid sign-in-token with refresh token', () => {
    const signToken = new SignInToken({
      accessToken: validAccessToken,
      refreshToken: validRefreshToken,
    });

    expect(signToken).toBeInstanceOf(SignInToken);
    expect(signToken.value.accessToken).toEqual(validAccessToken);
    expect(signToken.value.refreshToken).toEqual(validRefreshToken);
  });

  it('should throw invalid type', () => {
    expect(() => new SignInToken(1 as any)).toThrow();
    expect(() => new SignInToken({} as any)).toThrow();
    expect(() => new SignInToken([] as any)).toThrow();
    expect(() => new SignInToken(null as any)).toThrow();
    expect(() => new SignInToken(undefined as any)).toThrow();
  });

  it('should throw an error if access token is invalid', () => {
    expect(() => new SignInToken({ accessToken: 1 as any })).toThrow();
    expect(() => new SignInToken({ accessToken: {} as any })).toThrow();
    expect(() => new SignInToken({ accessToken: [] as any })).toThrow();
    expect(() => new SignInToken({ accessToken: null as any })).toThrow();
    expect(() => new SignInToken({ accessToken: undefined as any })).toThrow();
  });
});
