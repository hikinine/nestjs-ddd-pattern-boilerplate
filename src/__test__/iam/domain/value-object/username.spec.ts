import { Username } from '@iam/domain/value-object';

describe('vo sign-in-token', () => {
  const validUsername = 'username';
  it('should be defined', () => {
    expect(Username).toBeDefined();
  });

  it('should create a valid username', () => {
    const username = new Username(validUsername);
    expect(username).toBeInstanceOf(Username);
    expect(username.value).toEqual(validUsername);
  });

  it('should throw invalid type', () => {
    expect(() => new Username(1 as any)).toThrow();
    expect(() => new Username({} as any)).toThrow();
    expect(() => new Username([] as any)).toThrow();
    expect(() => new Username(null as any)).toThrow();
    expect(() => new Username(undefined as any)).toThrow();
  });

  it('should throw an error if username is invalid', () => {
    expect(() => new Username('')).toThrow();
  });
});
