import { FloatPrecision1 } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object ifloat_precision_1', () => {
  const PRECISION = 1;
  it('should be defined', () => {
    expect(FloatPrecision1).toBeDefined();
  });

  it('should create a valid float_precision_1', () => {
    const float = 1000.3535;
    const fixedFloat = Number(float.toFixed(PRECISION));
    const float_precision_1 = new FloatPrecision1(float);
    expect(float_precision_1).toBeInstanceOf(FloatPrecision1);
    expect(float_precision_1).toBeInstanceOf(Domain.ValueObject);
    expect(float_precision_1.value).not.toBe(float);
    expect(float_precision_1.value).toBe(fixedFloat);
  });

  it('should throw an error when try to create an invalid float_precision_1', () => {
    expect(() => new FloatPrecision1(null)).toThrow(DomainError);
    expect(() => new FloatPrecision1(undefined)).toThrow(DomainError);
    expect(() => new FloatPrecision1([] as any)).toThrow(DomainError);
    expect(() => new FloatPrecision1(true as any)).toThrow(DomainError);
  });

  it('should compare two float_precision_1s', () => {
    const float_precision_11 = new FloatPrecision1(1.5523);
    const float_precision_12 = new FloatPrecision1(2.01);
    const float_precision_13 = new FloatPrecision1(1.5523);

    expect(float_precision_11.isEqual(float_precision_12)).toBe(false);
    expect(float_precision_11.isEqual(float_precision_13)).toBe(true);
  });
});
