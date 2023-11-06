import { User } from '@iam/domain/entities';
/**
 * Revoke all permissions, tokens and user access.
 * @param user {User}
 */
export class RevokeUserAccessCommand {
  constructor(public readonly user: User) {}
}
