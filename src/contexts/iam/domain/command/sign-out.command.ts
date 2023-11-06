import { User } from '@iam/domain/entities';

export interface SignOutCommandProps {
  user: User;
  refreshToken: string;
}
/**
 * Sign out user. It will revoke refresh token if exist.
 * @param user {User}
 * @param refreshToken {string}
 */
export class SignOutCommand {
  constructor(public readonly props: SignOutCommandProps) {}
}
