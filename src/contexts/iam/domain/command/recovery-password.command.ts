import { User } from '@iam/domain/entities';

export interface RecoveryPasswordCommandProps {
  readonly user: User;
  readonly password: string;
  readonly token: string;
}
/**
 * Change user password if token is valid.
 * @param user {User}
 * @param password {string}
 * @param token {string}
 */
export class RecoveryPasswordCommand {
  constructor(public readonly props: RecoveryPasswordCommandProps) {}
}
