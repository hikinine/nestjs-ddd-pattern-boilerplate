import { UnsubscribeUserToGroupCommand } from '@iam/domain/command';
import { GroupRepository, UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UnsubscribeUserToGroupCommand)
export class UnsubscribeUserToGroupCommandHandler
  implements ICommandHandler<UnsubscribeUserToGroupCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: UnsubscribeUserToGroupCommand): Promise<void> {
    const author = this.context.getAuthor();
    const { user, group } = props;

    user.unsubscribeTo(group);
    user.setAuthorChange(author.id);
    await this.userRepository.update(user);
  }
}
