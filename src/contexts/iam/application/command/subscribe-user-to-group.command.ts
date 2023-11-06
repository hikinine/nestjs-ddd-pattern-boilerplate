import { SubscribeUserToGroupCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(SubscribeUserToGroupCommand)
export class SubscribeUserToGroupCommandHandler
  implements ICommandHandler<SubscribeUserToGroupCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: SubscribeUserToGroupCommand): Promise<void> {
    const author = this.context.getAuthor();
    const { user, group } = props;
    user.subscribeTo(group);
    user.setAuthorChange(author.id);
    await this.userRepository.update(user);
  }
}
