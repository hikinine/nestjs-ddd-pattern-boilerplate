import { User } from '@iam/domain/entities';

/**
 * Generate refresh token.
 * @param user {User}
 * @resolves {RefreshToken}
 */
export class GenerateRefreshTokenCommand {
  constructor(public readonly user: User) {}
}
