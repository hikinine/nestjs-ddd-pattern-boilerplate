import { Password } from '@iam/domain/value-object';

describe('vo password', () => {
  const validPassword = '12345678';

  it('should be defined', () => {
    expect(Password).toBeDefined();
  });

  it('should create a valid password', () => {
    const password = Password.createFromPlain(validPassword);
    expect(password).toBeInstanceOf(Password);
  });

  it('should match plain password', () => {
    const password = Password.createFromPlain(validPassword);
    const { hash } = password.value;
    expect(password.matchs(validPassword)).toBeTruthy();
    const newPassword = Password.createFromHash(hash);
    expect(password.isEqual(newPassword)).toBeTruthy();
  });

  it('should throw invalid password length', () => {
    const invalidPassword = '1234567';
    expect(() => Password.createFromPlain(invalidPassword)).toThrow();
  });
});
