import { CleanAllUserDataCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CleanAllUserDataCommand)
export class CleanAllUserDataCommandHandler
  implements ICommandHandler<CleanAllUserDataCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute({ props }: CleanAllUserDataCommand): Promise<void> {
    const { user } = props;
    user.revokeAll();
    await this.userRepository.delete(user);
  }
}
