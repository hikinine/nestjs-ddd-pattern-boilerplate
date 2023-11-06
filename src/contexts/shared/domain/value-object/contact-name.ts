import { Domain } from '@hiki9/rich-domain';

export class ContactName extends Domain.ValueObject<string> {
  protected static hooks = Domain.VoHooks({
    validation,
  });
}

function validation(props: string) {
  if (typeof props !== 'string') {
    return { message: 'Formato inválido para contactName' };
  }

  if (props.length < 1 || props.length > 80) {
    return { message: 'contactName deve ter entre 1 e 80 caracteres' };
  }
}
