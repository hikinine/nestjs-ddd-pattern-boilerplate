import { V } from '@lib/utils';
import { RefreshTokenProps } from '../refresh-token';

export function refreshTokenValidation(props: RefreshTokenProps) {
  if (V.notTypeOf(props.token, 'string')) {
    return { message: 'Formato inválido para token' };
  }

  if (V.notInstanceOf(props.expiresAt, Date)) {
    return { message: 'Formato inválido para expiresAt' };
  }

  if (V.notTypeOfOrNullable(props.userAgent, 'string')) {
    return { message: 'Formato inválido para userAgent' };
  }
}
