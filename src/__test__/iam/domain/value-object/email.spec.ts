import { DomainError } from '@hiki9/rich-domain/dist';
import { Email } from '@shared/domain/value-object';

describe('vo email', () => {
  const validEmail = 'valid-email@gmail.com';
  it('should be defined', () => {
    expect(Email).toBeDefined();
  });

  it('should create a valid email', () => {
    const email = new Email(validEmail);
    expect(email).toBeInstanceOf(Email);
    expect(email.value).toEqual(validEmail);
  });

  it('should throw invalid type', () => {
    expect(() => new Email(1 as any)).toThrow(DomainError);
    expect(() => new Email({} as any)).toThrow(DomainError);
    expect(() => new Email([] as any)).toThrow(DomainError);
    expect(() => new Email(null as any)).toThrow(DomainError);
    expect(() => new Email(undefined as any)).toThrow(DomainError);
  });

  it('should throw an error if email is invalid', () => {
    expect(() => new Email('invalid-email')).toThrow(DomainError);
  });
});
