import { CreateGroupCommand } from '@iam/domain/command';
import { GroupRepository } from '@iam/domain/repositories';
import { IsGroupExistsDomainService } from '@iam/domain/service';
import { AuthorContextService } from '@lib/common';
import { ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateGroupCommand)
export class CreateGroupCommandHandler
  implements ICommandHandler<CreateGroupCommand>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly isGroupExistsDomainService: IsGroupExistsDomainService,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: CreateGroupCommand): Promise<void> {
    const { group } = props;
    const author = this.context.getAuthor();
    group.setAuthor(author.id);

    const exists = await this.isGroupExistsDomainService.execute(group.name);
    if (exists) {
      throw new ConflictException('Group already exists.');
    }

    await this.groupRepository.create(group);
  }
}
