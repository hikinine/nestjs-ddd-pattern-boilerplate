import { Domain } from '@hiki9/rich-domain';
import { isInt } from 'class-validator';

export class Uint extends Domain.ValueObject<number> {
  protected static hooks = Domain.VoHooks({
    validation(value: number) {
      if (!isInt(value)) return { message: 'Formato inválido para Uint' };
      if (value < 0) return { message: 'Formato inválido para Uint' };
    },
  });
}
