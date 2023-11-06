import { Uint } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object uint', () => {
  it('should be defined', () => {
    expect(Uint).toBeDefined();
  });

  it('should create a valid uint', () => {
    const uint = new Uint(1);
    expect(uint).toBeInstanceOf(Uint);
    expect(uint).toBeInstanceOf(Domain.ValueObject);
    expect(uint.value).toBe(1);

    const uint2 = new Uint(0);
    expect(uint2).toBeInstanceOf(Uint);
    expect(uint2).toBeInstanceOf(Domain.ValueObject);
    expect(uint2.value).toBe(0);
  });

  it('should throw an error when try to create an invalid uint', () => {
    expect(() => new Uint(-1)).toThrow(DomainError);
    expect(() => new Uint(-0.1)).toThrow(DomainError);
    expect(() => new Uint(NaN)).toThrow(DomainError);
    expect(() => new Uint(Infinity)).toThrow(DomainError);
    expect(() => new Uint(1.1)).toThrow(DomainError);
    expect(() => new Uint(1000 + 0.01)).toThrow(DomainError);
    expect(() => new Uint(10 / 3)).toThrow(DomainError);
  });

  it('should compare two uints', () => {
    const uint1 = new Uint(1);
    const uint2 = new Uint(2);
    const uint3 = new Uint(1);

    expect(uint1.isEqual(uint2)).toBe(false);
    expect(uint1.isEqual(uint3)).toBe(true);
  });
});
