import { DomainError } from '@hiki9/rich-domain/dist';
import { UpdateUserBasicInfoCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(UpdateUserBasicInfoCommand)
export class UpdateUserBasicInfoCommandHandler
  implements ICommandHandler<UpdateUserBasicInfoCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({
    propsToChange,
    user,
  }: UpdateUserBasicInfoCommand): Promise<void> {
    const author = this.context.getAuthor();

    if (!author.isTheSameAs(user)) {
      throw new DomainError('Only the same user can update the user');
    }

    if (propsToChange?.phone) {
      user.changePhone(propsToChange.phone);
    }

    if (propsToChange?.username) {
      user.changeUsername(propsToChange.username);
    }

    if (propsToChange?.office) {
      user.changeOffice(propsToChange.office);
    }

    return await this.userRepository.update(user);
  }
}
