import { ChangeGroupPermissionCommand } from '@iam/domain/command';
import { GroupRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ChangeGroupPermissionCommand)
export class ChangeGroupPermissionCommandHandler
  implements ICommandHandler<ChangeGroupPermissionCommand>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: ChangeGroupPermissionCommand): Promise<void> {
    const { group, propsToChange } = props;
    const author = this.context.getAuthor();

    group.setAuthorChange(author.id);

    if (propsToChange.name) {
      group.changeName(propsToChange.name);
    }
    if (propsToChange.isDepartment) {
      group.changeIsDepartment(propsToChange.isDepartment);
    }
    if (propsToChange.permissions) {
      group.changePermissions(propsToChange.permissions);
    }
    await this.groupRepository.update(group);
  }
}
