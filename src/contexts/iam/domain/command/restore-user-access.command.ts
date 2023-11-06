import { User } from '@iam/domain/entities';

/**
 * Restore user access.
 * @param user {User}
 */
export class RestoreUserAccessCommand {
  constructor(public readonly user: User) {}
}
