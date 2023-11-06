import { Domain, DomainError } from '@hiki9/rich-domain';

export class FloatPrecision4 extends Domain.ValueObject<number> {
  public precision = 4 as const;

  protected static hooks = Domain.VoHooks({
    validation(value: number) {
      if (typeof value !== 'number')
        return { message: 'Formato inválido para FloatPrecision4' };
    },
    transformBeforeCreate(value: number) {
      if (typeof value !== 'number')
        throw new DomainError('Invalid FloatPrecision4 value');
      return Number(value.toFixed(4));
    },
  });
}
