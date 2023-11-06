import { User } from '@iam/domain/entities';

/**
 * Generate access token.
 * It throw UnauthorizedException if password is not valid.
 * @param user {User}
 * @param password {string}
 * @resolves {SignInToken}
 */
export class GenerateAccessTokenCommand {
  constructor(
    public readonly user: User,
    public readonly password: string,
  ) {}
}
