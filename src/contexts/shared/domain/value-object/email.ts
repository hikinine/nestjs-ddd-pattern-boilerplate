import { Domain } from '@hiki9/rich-domain';
import { isEmail } from 'class-validator';

export class Email extends Domain.ValueObject<string> {
  protected static hooks = Domain.VoHooks({
    validation(value) {
      if (!isEmail(value)) {
        return { message: 'Formato inválido para email' };
      }
    },
  });
}
