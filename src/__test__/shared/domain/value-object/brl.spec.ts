import { BRL } from '@app/contexts/shared/domain';
import { Domain, DomainError } from '@hiki9/rich-domain/dist';

describe('@shared value-object ibrl', () => {
  it('should be defined', () => {
    expect(BRL).toBeDefined();
  });

  it('should create a valid brl', () => {
    const brl = new BRL(1000);
    expect(brl).toBeInstanceOf(BRL);
    expect(brl).toBeInstanceOf(Domain.ValueObject);
    expect(brl.value).toBe(1000);
    expect(brl.formated).toBe('R$ 1.000,00');
  });

  it('should create a valid brl with cents', () => {
    const brl = new BRL(1000.01);
    expect(brl).toBeInstanceOf(BRL);
    expect(brl).toBeInstanceOf(Domain.ValueObject);
    expect(brl.value).toBe(1000.01);
    expect(brl.formated).toBe('R$ 1.000,01');
  });

  it('should ensure toFixed to 2 digits', () => {
    const brl = new BRL(1000.001);
    expect(brl).toBeInstanceOf(BRL);
    expect(brl).toBeInstanceOf(Domain.ValueObject);
    expect(brl.value).toBe(1000.0);
    expect(brl.formated).toBe('R$ 1.000,00');

    const brl2 = new BRL(1000.154);
    expect(brl2).toBeInstanceOf(BRL);
    expect(brl2).toBeInstanceOf(Domain.ValueObject);
    expect(brl2.value).not.toBe(1000.154);
    expect(brl2.value).toBe(1000.15);
    expect(brl2.formated).not.toBe('R$ 1.000,154');
    expect(brl2.formated).toBe('R$ 1.000,15');
  });

  it('should throw an error when try to create an invalid brl', () => {
    expect(() => new BRL(-0.1)).toThrow(DomainError);
    expect(() => new BRL(-1)).toThrow(DomainError);
  });

  it('should compare two brls', () => {
    const brl1 = new BRL(1);
    const brl2 = new BRL(2);
    const brl3 = new BRL(1);

    expect(brl1.isEqual(brl2)).toBe(false);
    expect(brl1.isEqual(brl3)).toBe(true);
  });
});
