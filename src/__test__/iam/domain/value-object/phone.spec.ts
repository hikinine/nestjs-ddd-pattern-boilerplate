import { Phone } from '@shared/domain/value-object';

describe('phone vo', () => {
  const validPhone = '(71) 99295-6282';
  const validPhone2 = '(71) 9295-6282';

  it('should be defined', () => {
    expect(Phone).toBeDefined();
  });

  it('should create a valid phone', () => {
    const phone = new Phone(validPhone);
    expect(phone).toBeInstanceOf(Phone);
    expect(phone.value).toEqual(validPhone);

    const phone2 = new Phone(validPhone2);
    expect(phone2).toBeInstanceOf(Phone);
    expect(phone2.value).toEqual(validPhone2);
  });

  it('should throw invalid type', () => {
    expect(() => new Phone(1 as any)).toThrow();
    expect(() => new Phone({} as any)).toThrow();
    expect(() => new Phone([] as any)).toThrow();
    expect(() => new Phone(null as any)).toThrow();
    expect(() => new Phone(undefined as any)).toThrow();
  });

  it('should throw an error if phone is invalid', () => {
    expect(() => new Phone('')).toThrow();
    expect(() => new Phone('123')).toThrow();
    expect(
      () =>
        new Phone(
          '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
        ),
    ).toThrow();
  });
});
