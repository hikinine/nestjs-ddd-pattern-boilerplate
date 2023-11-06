import { Domain, DomainError } from '@hiki9/rich-domain';

export class FloatPrecision1 extends Domain.ValueObject<number> {
  public precision = 1 as const;

  protected static hooks = Domain.VoHooks({
    validation(value: number) {
      if (typeof value !== 'number')
        return { message: 'Formato inválido para FloatPrecision1' };
    },
    transformBeforeCreate(value: number) {
      if (typeof value !== 'number')
        throw new DomainError('Invalid FloatPrecision4 value');
      return Number(value.toFixed(1));
    },
  });
}
