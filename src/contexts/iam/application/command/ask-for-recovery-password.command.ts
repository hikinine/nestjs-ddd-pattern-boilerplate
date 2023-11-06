import { AskForRecoveryPasswordCommand } from '@iam/domain/command';
import { RecoveryPassword } from '@iam/domain/entities';
import { UserAskOrRenewRecoveryPasswordEvent } from '@iam/domain/events';
import { UserRepository } from '@iam/domain/repositories';
import { hours } from '@lib/common';
import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(AskForRecoveryPasswordCommand)
export class AskForRecoveryPasswordCommandHandler
  implements ICommandHandler<AskForRecoveryPasswordCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    user,
  }: AskForRecoveryPasswordCommand): Promise<RecoveryPassword> {
    if (!user.isActive()) {
      throw new ForbiddenException('Usuário desativado.');
    }

    const recoveryPassword =
      user.getOnGoingRecoveryPasswordIfExists() ||
      user.registerAnRequestToRecoveryPassword();

    if (recoveryPassword.countHowManyTillExpires() < hours(2)) {
      recoveryPassword.renew();
    }

    user.addEvent(
      new UserAskOrRenewRecoveryPasswordEvent(user, recoveryPassword),
    );

    await this.userRepository.update(user);
    return recoveryPassword;
  }
}
