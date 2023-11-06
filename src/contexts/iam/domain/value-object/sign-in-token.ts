import { Domain } from '@hiki9/rich-domain';
import { V } from '@lib/utils';

export interface SignInTokenProps {
  accessToken: string;
  refreshToken?: string;
}

export class SignInToken extends Domain.ValueObject<SignInTokenProps> {
  protected static hooks = Domain.VoHooks<SignInTokenProps>({
    validation,
  });
}

function validation(props: SignInTokenProps) {
  if (V.notTypeOf(props.accessToken, 'string')) {
    return { message: 'Formato inválido para accessToken' };
  }

  if (V.NotLength(props.accessToken, 1, 600)) {
    return { message: 'accessToken deve ter entre 1 e 600 caracteres' };
  }

  if (V.notTypeOfOrNullable(props.refreshToken, 'string')) {
    return { message: 'Formato inválido para refreshToken' };
  }
}
