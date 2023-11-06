import { RecoveryPasswordCommand } from '@iam/domain/command';
import { UserRepository } from '@iam/domain/repositories';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordCommandHandler
  implements ICommandHandler<RecoveryPasswordCommand>
{
  constructor(private readonly repo: UserRepository) {}

  async execute({ props }: RecoveryPasswordCommand): Promise<void> {
    const { user, password, token } = props;
    user.recoveryPassword(password, token);
    await this.repo.update(user);
  }
}
