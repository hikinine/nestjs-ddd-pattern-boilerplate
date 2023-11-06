import { CreateUserCommand } from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { IsUserExistsDomainService } from '@iam/domain/service';
import { AuthorContextService } from '@lib/common';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly isUserExistsDomainService: IsUserExistsDomainService,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: CreateUserCommand): Promise<void> {
    const author = this.context.getAuthor();
    const { user } = props;
    user.setAuthor(author.id);

    const [usernameIsRegistered, userProviderIsRegistered] = await Promise.all([
      this.isUserExistsDomainService.execute(user.username.value),
      this.userProviderIsAlreadyRegistered(user),
    ]);

    if (usernameIsRegistered) {
      throw new ConflictException('Usuário já registrado.');
    }

    if (userProviderIsRegistered) {
      throw new ConflictException('Usuário já registrado. (Provider Conflict)');
    }

    if (!user.isActive()) {
      user.restoreUserAccess();
    }

    await this.userRepository.create(user);
  }

  private async userProviderIsAlreadyRegistered(user: User) {
    const userProviderIds = user.getExternalUserProvidersIds();
    if (!userProviderIds.length) {
      return false;
    }

    try {
      const users = await Promise.all(
        userProviderIds.map((providerId) =>
          this.userRepository.findByOAuthUserId(providerId),
        ),
      );

      const foundUser = users.some((user) => user instanceof User);

      return foundUser;
    } catch (error) {
      return false;
    }
  }
}
