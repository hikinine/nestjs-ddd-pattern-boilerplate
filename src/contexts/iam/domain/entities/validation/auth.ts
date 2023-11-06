import { OAuth, Password } from '@iam/domain/value-object';
import { V } from '@lib/utils';
import { AuthProps } from '../auth';
import { RecoveryPassword } from '../recovery-password';
import { RefreshToken } from '../refresh-token';

export function authValidation(props: AuthProps) {
  if (V.notInstanceOf(props.password, Password)) {
    return { message: 'Formato inválido para password' };
  }

  if (V.notArrayOfInstanceOf(props.oauth, OAuth)) {
    return { message: 'Formato inválido para oauth' };
  }

  if (V.notArrayOfInstanceOf(props.refreshToken, RefreshToken)) {
    return { message: 'Formato inválido para refreshToken' };
  }

  if (V.notArrayOfInstanceOf(props.activeRecoveryPassword, RecoveryPassword)) {
    return { message: 'Formato inválido para activeRecoveryPassword' };
  }
}
