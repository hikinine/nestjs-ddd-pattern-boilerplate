import { V } from '@lib/utils';
import { RecoveryPasswordProps } from '../recovery-password';

export function recoveryPasswordValidation(props: RecoveryPasswordProps) {
  if (V.notInstanceOfOrNullable(props.expiresAt, Date)) {
    return { message: 'Formato inválido para expiresAt' };
  }

  if (V.notTypeOfOrNullable(props.passwordWasRecovered, 'boolean')) {
    return { message: 'Formato inválido para passwordWasRecovered' };
  }

  if (V.notInstanceOfOrNullable(props.passwordWasRecoveredAt, Date)) {
    return { message: 'Formato inválido para passwordWasRecoveredAt' };
  }
}
