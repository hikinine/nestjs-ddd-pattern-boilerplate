import { GenerateRefreshTokenCommand } from '@iam/domain/command';
import { RefreshToken } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { AuthorContextService } from '@lib/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(GenerateRefreshTokenCommand)
export class GenerateRefreshTokenCommandHandler
  implements ICommandHandler<GenerateRefreshTokenCommand>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly context: AuthorContextService,
  ) {}

  async execute(props: GenerateRefreshTokenCommand): Promise<RefreshToken> {
    const { user } = props;
    const store = this.context.getStore();
    const refreshToken = user.registerAnRefreshTokenAccess(store?.userAgent);
    await this.userRepository.update(user);
    return refreshToken;
  }
}
