import { SignOutCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(SignOutCommand)
export class SignOutCommandHandler implements ICommandHandler<SignOutCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ props }: SignOutCommand): Promise<void> {
    const { user, refreshToken } = props;
    const exists = user.revokeRefreshTokenIfExists(refreshToken);
    if (exists) await this.userRepository.update(user);
  }
}
