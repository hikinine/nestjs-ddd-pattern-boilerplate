import { User } from '@iam/domain/entities';

/**
 * sign in with strategy using refresh token.
 * @param user {User}
 * @param refreshToken {String}
 * @resolves SignInToken
 */
export class AuthenticateUserWithRefreshTokenCommand {
  constructor(
    public readonly user: User,
    public readonly refreshToken: string,
  ) {}
}
