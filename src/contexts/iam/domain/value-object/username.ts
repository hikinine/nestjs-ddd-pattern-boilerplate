import { Domain } from '@hiki9/rich-domain';
import { V } from '@lib/utils';

export class Username extends Domain.ValueObject<string> {
  protected static hooks = Domain.VoHooks({
    validation,
  });
}

function validation(value: string) {
  if (V.notTypeOf(value, 'string')) {
    return { message: 'Formato inválido para username' };
  }

  if (V.NotLength(value, 1, 60)) {
    return { message: 'username deve ter entre 1 e 60 caracteres' };
  }
}
