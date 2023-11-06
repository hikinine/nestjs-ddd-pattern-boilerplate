import { FloatPrecision2 } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object FloatPrecision2', () => {
  const PRECISION = 2;
  it('should be defined', () => {
    expect(FloatPrecision2).toBeDefined();
  });

  it('should create a valid FloatPrecision2', () => {
    const float = 1000.3535;
    const fixedFloat = Number(float.toFixed(PRECISION));
    const float_precision_2 = new FloatPrecision2(float);
    expect(float_precision_2).toBeInstanceOf(FloatPrecision2);
    expect(float_precision_2).toBeInstanceOf(Domain.ValueObject);
    expect(float_precision_2.value).not.toBe(float);
    expect(float_precision_2.value).toBe(fixedFloat);
  });

  it('should throw an error when try to create an invalid FloatPrecision2', () => {
    expect(() => new FloatPrecision2(null)).toThrow(DomainError);
    expect(() => new FloatPrecision2(undefined)).toThrow(DomainError);
    expect(() => new FloatPrecision2([] as any)).toThrow(DomainError);
    expect(() => new FloatPrecision2(true as any)).toThrow(DomainError);
  });

  it('should compare two FloatPrecision2', () => {
    const fp1 = new FloatPrecision2(1.5523);
    const fp2 = new FloatPrecision2(1.5423);
    const fp3 = new FloatPrecision2(1.5525);

    expect(fp1.isEqual(fp2)).toBe(false);
    expect(fp1.isEqual(fp3)).toBe(true);
  });
});
