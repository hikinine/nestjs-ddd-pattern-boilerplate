import { GenerateAccessTokenCommand } from '@iam/domain/command';
import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

@CommandHandler(GenerateAccessTokenCommand)
export class GenerateAccessTokenCommandHandler
  implements ICommandHandler<GenerateAccessTokenCommand>
{
  constructor(private readonly jwtService: JwtService) {}

  async execute({ user, password }: GenerateAccessTokenCommand) {
    if (!user.passwordMatchsWith(password)) {
      throw new UnauthorizedException({ message: 'Invalid credentials' });
    }

    const signIn = user.signInWithStrategy(this.jwtService);
    return signIn;
  }
}
