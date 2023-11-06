import { Domain, DomainError } from '@hiki9/rich-domain';

export class FloatPrecision2 extends Domain.ValueObject<number> {
  public precision = 2 as const;

  protected static hooks = Domain.VoHooks({
    validation(value: number) {
      if (typeof value !== 'number')
        return { message: 'Formato inválido para FloatPrecision2' };
    },
    transformBeforeCreate(value: number) {
      if (typeof value !== 'number')
        throw new DomainError('Invalid FloatPrecision2 value');
      return Number(value.toFixed(2));
    },
  });
}
