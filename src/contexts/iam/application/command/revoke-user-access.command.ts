import { ApplicationLevelError } from '@hiki9/rich-domain/dist';
import { RevokeUserAccessCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(RevokeUserAccessCommand)
export class RevokeUserAccessCommandHandler
  implements ICommandHandler<RevokeUserAccessCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ user }: RevokeUserAccessCommand): Promise<void> {
    const author = this.context.getAuthor();

    if (author.isTheSameAs(user)) {
      throw new ApplicationLevelError(
        `Você não pode revogar seu próprio acesso.`,
      );
    }

    if (!user.active) {
      throw new ApplicationLevelError(
        `O usuário ${user.username.value} (${user.id.value}) já está inativo.`,
      );
    }

    user.revokeAllPermissions();
    user.revokeUserAccess();
    user.setAuthorChange(author.id);
    await this.userRepository.update(user);
  }
}
