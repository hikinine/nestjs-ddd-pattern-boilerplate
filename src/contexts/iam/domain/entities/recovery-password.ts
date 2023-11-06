import { Domain } from '@hiki9/rich-domain';
import { Id } from '@hiki9/rich-domain/dist/core';
import { recoveryPasswordValidation } from './validation/recovery-password';

export interface RecoveryPasswordProps extends Domain.EntityProps {
  expiresAt?: Date;
  passwordWasRecovered?: boolean;
  passwordWasRecoveredAt?: Date;
}

const hooks = Domain.Hooks<RecoveryPassword, RecoveryPasswordProps>({
  validation: recoveryPasswordValidation,
  transformBeforeCreate(props) {
    const expiresAt = new Date(Date.now() + RecoveryPassword.EXPIRES_AT);
    return {
      ...(props || {}),
      id: props?.id || RecoveryPassword.generateRandomToken(),
      passwordWasRecovered: props?.passwordWasRecovered || false,
      passwordWasRecoveredAt: props?.passwordWasRecoveredAt || null,
      expiresAt: props?.expiresAt || expiresAt,
    } as RecoveryPasswordProps;
  },
});
export class RecoveryPassword extends Domain.Entity<RecoveryPasswordProps> {
  protected static hooks = hooks;
  public static readonly EXPIRES_AT = 24 * 1000 * 60 * 60;

  /**
   * Calculates the time difference between the current time and a specified expiration time.
   * @returns {number} the difference in milliseconds between the current time and the expiration
   */
  public countHowManyTillExpires(): number {
    const now = Date.now();
    const expiresAt = this.expiresAt.getTime();
    const diff = expiresAt - now;
    return diff;
  }

  //ALIAS for invalidate
  public revoke() {
    this.invalidate();
  }
  /**
   * The function invalidates the recovery token.
   */
  public invalidate() {
    this.props.expiresAt = new Date(Date.now() - 1);
  }
  /**
   * The "recovery" function sets the "passwordWasRecovered" property to true and records the date and
   * time of the recovery.
   */
  public recovery() {
    this.props.passwordWasRecovered = true;
    this.props.passwordWasRecoveredAt = new Date();
  }
  /**
   * This function renews the expiration date of a password recovery request if the password was not
   * already recovered.
   */
  public renew() {
    if (!this.passwordWasRecovered) {
      this.props.expiresAt = new Date(Date.now() + RecoveryPassword.EXPIRES_AT);
    }
  }
  /**
   * The function checks if the password is not expired and has not been recovered.
   * @returns boolean
   */
  public isValid() {
    return !this.isExpired() && !this.passwordWasRecovered;
  }
  /**
   * The function checks if the current time is after the expiration time.
   * @returns boolean.
   */
  public isExpired() {
    return Date.now() > this.expiresAt.getTime();
  }

  get recoveryUrl(): string {
    return `/recovery-password/${this.token}`;
  }

  get token(): string {
    return this.props.id.value;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get passwordWasRecovered(): boolean {
    return this.props.passwordWasRecovered;
  }

  get passwordWasRecoveredAt(): Date | undefined {
    return this.props.passwordWasRecoveredAt;
  }

  constructor(props?: RecoveryPasswordProps) {
    super(props);
  }

  public static generateRandomToken() {
    const random = Array.from({ length: 3 }).map(() => new Id().value);
    const id = new Id(random.join(''));
    return id.cloneAsNew();
  }
}
