import { Int } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object iint', () => {
  it('should be defined', () => {
    expect(Int).toBeDefined();
  });

  it('should create a valid int', () => {
    const int = new Int(1);
    expect(int).toBeInstanceOf(Int);
    expect(int).toBeInstanceOf(Domain.ValueObject);
    expect(int.value).toBe(1);

    const int2 = new Int(0);
    expect(int2).toBeInstanceOf(Int);
    expect(int2).toBeInstanceOf(Domain.ValueObject);
    expect(int2.value).toBe(0);

    const int3 = new Int(-1);
    expect(int3).toBeInstanceOf(Int);
    expect(int3).toBeInstanceOf(Domain.ValueObject);
    expect(int3.value).toBe(-1);
  });

  it('should throw an error when try to create an invalid int', () => {
    expect(() => new Int(-0.1)).toThrow(DomainError);
    expect(() => new Int(NaN)).toThrow(DomainError);
    expect(() => new Int(Infinity)).toThrow(DomainError);
    expect(() => new Int(1.1)).toThrow(DomainError);
    expect(() => new Int(1000 + 0.01)).toThrow(DomainError);
    expect(() => new Int(10 / 3)).toThrow(DomainError);
  });

  it('should compare two ints', () => {
    const int1 = new Int(1);
    const int2 = new Int(2);
    const int3 = new Int(1);

    expect(int1.isEqual(int2)).toBe(false);
    expect(int1.isEqual(int3)).toBe(true);
  });
});
