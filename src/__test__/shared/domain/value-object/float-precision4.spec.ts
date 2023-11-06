import { FloatPrecision4 } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object FloatPrecision4', () => {
  const PRECISION = 4;
  it('should be defined', () => {
    expect(FloatPrecision4).toBeDefined();
  });

  it('should create a valid FloatPrecision4', () => {
    const float = 1000.3535555;
    const fixedFloat = Number(float.toFixed(PRECISION));
    const float_precision_4 = new FloatPrecision4(float);
    expect(float_precision_4).toBeInstanceOf(FloatPrecision4);
    expect(float_precision_4).toBeInstanceOf(Domain.ValueObject);
    expect(float_precision_4.value).not.toBe(float);
    expect(float_precision_4.value).toBe(fixedFloat);
  });

  it('should throw an error when try to create an invalid FloatPrecision4', () => {
    expect(() => new FloatPrecision4(null)).toThrow(DomainError);
    expect(() => new FloatPrecision4(undefined)).toThrow(DomainError);
    expect(() => new FloatPrecision4([] as any)).toThrow(DomainError);
    expect(() => new FloatPrecision4(true as any)).toThrow(DomainError);
  });

  it('should compare two FloatPrecision4', () => {
    const fp1 = new FloatPrecision4(1.552322);
    const fp2 = new FloatPrecision4(1.552);
    const fp3 = new FloatPrecision4(1.552311);

    expect(fp2.isEqual(fp1)).toBe(false);
    expect(fp1.isEqual(fp3)).toBe(true);
  });
});
