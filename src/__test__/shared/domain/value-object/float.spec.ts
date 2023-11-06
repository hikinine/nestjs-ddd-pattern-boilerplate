import { Float } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object float', () => {
  it('should be defined', () => {
    expect(Float).toBeDefined();
  });

  it('should create a valid float', () => {
    const value = 1000.3535;
    const float = new Float(value);
    expect(float).toBeInstanceOf(Float);
    expect(float).toBeInstanceOf(Domain.ValueObject);
    expect(float.value).toBe(value);
  });

  it('should throw an error when try to create an invalid float', () => {
    expect(() => new Float(null)).toThrow(DomainError);
    expect(() => new Float(undefined)).toThrow(DomainError);
    expect(() => new Float([] as any)).toThrow(DomainError);
    expect(() => new Float(true as any)).toThrow(DomainError);
  });

  it('should compare two floats', () => {
    const float1 = new Float(1.5523);
    const float2 = new Float(2.01);
    const float3 = new Float(1.5523);

    expect(float1.isEqual(float2)).toBe(false);
    expect(float1.isEqual(float3)).toBe(true);
  });
});
