import { Domain, DomainError } from '@hiki9/rich-domain';
import { OAuth, Password } from '@iam/domain/value-object';
import { RecoveryPassword } from './recovery-password';
import { RefreshToken } from './refresh-token';
import { authValidation } from './validation/auth';

export interface AuthProps extends Domain.EntityProps {
  password: Password;
  oauth?: OAuth[];
  refreshToken?: RefreshToken[];
  activeRecoveryPassword?: RecoveryPassword[];
}
const hooks = Domain.Hooks<Auth, AuthProps>({
  validation: authValidation,
  transformBeforeCreate(props) {
    props.activeRecoveryPassword = props.activeRecoveryPassword || [];
    props.refreshToken = props.refreshToken || [];
    props.oauth = props.oauth || [];
    return props;
  },
});
export class Auth extends Domain.Entity<AuthProps> {
  protected static hooks = hooks;

  public revokeAllTokens() {
    this.props.refreshToken = [];
    this.props.activeRecoveryPassword = [];
    this.props.oauth = [];
  }

  private isTokenRegistered(token: string): boolean {
    return this.props.activeRecoveryPassword.some(
      (recoveryPassword) => recoveryPassword.token === token,
    );
  }
  public recoveryPassword(token: string) {
    const tokenIsRegistered = this.isTokenRegistered(token);

    if (!tokenIsRegistered) {
      throw new DomainError('Token não é válido');
    }

    this.props.activeRecoveryPassword
      .filter((recoveryPassword) => recoveryPassword.isValid())
      .forEach((recoveryPassword) => {
        if (recoveryPassword.token === token) {
          recoveryPassword.recovery();
        } else {
          recoveryPassword.invalidate();
        }
      });
  }

  public registerAnRequestToRecoveryPassword() {
    const recoveryPassword = new RecoveryPassword();
    this.props.activeRecoveryPassword.push(recoveryPassword);
    return recoveryPassword;
  }

  public getValidRecoveryPassword() {
    return this.activeRecoveryPassword.find((recoveryPassword) =>
      recoveryPassword.isValid(),
    );
  }

  public changePassword(newPassword: string) {
    if (this.passwordMatchs(newPassword)) {
      throw new DomainError('A nova senha não pode ser igual a antiga.');
    }

    this.props.password = Password.createFromPlain(newPassword);
  }

  public getPasswordHash() {
    return this.props.password.value.hash;
  }

  public passwordMatchs(password: string) {
    return this.props.password.matchs(password);
  }
  get activeRecoveryPassword() {
    return this.props.activeRecoveryPassword;
  }

  get password() {
    return this.props.password;
  }

  get refreshToken() {
    return this.props.refreshToken;
  }

  get oauth() {
    return this.props.oauth;
  }
}
