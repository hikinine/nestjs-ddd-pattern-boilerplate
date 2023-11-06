import { Domain } from '@hiki9/rich-domain';

export class Float extends Domain.ValueObject<number> {
  protected static hooks = Domain.VoHooks({
    validation(value: number) {
      if (typeof value !== 'number')
        return { message: 'Formato inválido para FloatPrecision' };
    },
  });
}
