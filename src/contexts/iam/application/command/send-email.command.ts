import { SendEmailCommand } from '@iam/domain/command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(SendEmailCommand)
export class SendEmailCommandHandler
  implements ICommandHandler<SendEmailCommand>
{
  async execute({ props }: SendEmailCommand): Promise<any> {
    console.log('Sending email', props);
  }
}
