import { ChangeUserPermissionsCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ChangeUserPermissionsCommand)
export class ChangeUserPermissionsCommandHandler
  implements ICommandHandler<ChangeUserPermissionsCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: ChangeUserPermissionsCommand): Promise<void> {
    const { user, permissions } = props;
    const author = this.context.getAuthor();

    if (author.id === user.id.value) {
      throw new ForbiddenException(
        'Você não pode alterar suas próprias permissões',
      );
    }

    user.changePermissions(permissions);
    user.setAuthorChange(author.id);
    await this.userRepository.update(user);
  }
}
