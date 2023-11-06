import { AuthenticateUserWithRefreshTokenCommand } from '@iam/domain/command';
import { AuthenticateStrategyPolicy } from '@iam/domain/policies/authenticate-strategy.interface';
import { UserRepository } from '@iam/domain/repositories';
import { SignInToken } from '@iam/domain/value-object';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(AuthenticateUserWithRefreshTokenCommand)
export class AuthenticateUserWithRefreshTokenCommandHandler
  implements ICommandHandler<AuthenticateUserWithRefreshTokenCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authenticateStrategyPolicy: AuthenticateStrategyPolicy,
  ) {}

  async execute({
    user,
    refreshToken,
  }: AuthenticateUserWithRefreshTokenCommand): Promise<SignInToken> {
    const signIn = user.signInWithStrategyUsingRefreshToken(
      refreshToken,
      this.authenticateStrategyPolicy,
    );

    await this.userRepository.update(user);
    return signIn;
  }
}
