import { ApplicationLevelError } from '@hiki9/rich-domain/dist';
import { RestoreUserAccessCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/provider';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(RestoreUserAccessCommand)
export class RestoreUserAccessCommandHandler
  implements ICommandHandler<RestoreUserAccessCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ user }: RestoreUserAccessCommand): Promise<void> {
    const author = this.context.getAuthor();

    if (author.isTheSameAs(user)) {
      throw new ApplicationLevelError(
        `Você não pode restaurar seu próprio acesso.`,
      );
    }

    if (user.active) {
      throw new ApplicationLevelError(
        `O usuário ${user.email.value} (${user.id.value}) já está ativo.`,
      );
    }
    user.restoreUserAccess();
    await this.userRepository.update(user);
  }
}
