import { ApplicationLevelError } from '@hiki9/rich-domain';
import { UserService } from '@iam/application/service';
import {
  AskForRecoveryPasswordCommand,
  AuthenticateUserWithRefreshTokenCommand,
  GenerateAccessTokenCommand,
  GenerateRefreshTokenCommand,
  RecoveryPasswordCommand,
  SignOutCommand,
} from '@iam/domain/command';
import { RefreshToken } from '@iam/domain/entities';
import { AuthenticateStrategyPolicy } from '@iam/domain/policies';
import { SignInToken } from '@iam/domain/value-object/sign-in-token';
import {
  AuthorContextService,
  EventPublisher,
  Transactional,
  UnitOfWorkService,
} from '@lib/common';
import {
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => EventPublisher))
    private readonly publisher: EventPublisher,
    @Inject(forwardRef(() => AuthorContextService))
    private readonly context: AuthorContextService,
    private readonly commandBus: CommandBus,
    private readonly unitOfWorkService: UnitOfWorkService,
    private readonly authenticateStrategy: AuthenticateStrategyPolicy,
  ) {
    this.unitOfWorkService.allowTransaction(this);
  }

  async signInWithBasic(
    email: string,
    password: string,
    keepMeLoggedIn?: boolean,
  ): Promise<SignInToken> {
    const user = await this.userService.findUserByEmail(email);
    const command = new GenerateAccessTokenCommand(user, password);
    const signInToken: SignInToken = await this.commandBus.execute(command);
    if (!keepMeLoggedIn) {
      return signInToken;
    }
    const generateRefreshTokenCommand = new GenerateRefreshTokenCommand(user);
    const { token: refreshToken }: RefreshToken = await this.commandBus.execute(
      generateRefreshTokenCommand,
    );
    const { accessToken } = signInToken.value;
    return new SignInToken({ accessToken, refreshToken });
  }

  async signInUsingRefreshToken(refreshToken: string): Promise<SignInToken> {
    const user = await this.userService.findUserByRefreshToken(refreshToken);
    const command = new AuthenticateUserWithRefreshTokenCommand(
      user,
      refreshToken,
    );
    const signInToken: SignInToken = await this.commandBus.execute(command);
    return signInToken;
  }

  @Transactional()
  async recoveryPasswordByUsingTokenThenSignIn(
    token: string,
    password: string,
  ): Promise<SignInToken> {
    const { isValid } = await this.verifyIfRecoveryPasswordTokenIsValid(token);
    if (!isValid) {
      throw new ApplicationLevelError('Token expirado ou inválido.');
    }
    const user = await this.userService.findUserByRecoveryToken(token);
    const email = user.email.value;
    const keepMeLoggedIn = true;
    const command = new RecoveryPasswordCommand({ user, password, token });
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
    const signInToken = await this.signInWithBasic(
      email,
      password,
      keepMeLoggedIn,
    );

    return signInToken;
  }

  @Transactional()
  async signOut(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const author = this.context.getAuthor();
    const user = await this.userService.findUserByRefreshToken(refreshToken);

    if (!author) {
      throw new ForbiddenException('Usuário não autenticado.');
    }
    if (!author.isTheSameAs(user)) {
      throw new ForbiddenException();
    }
    const command = new SignOutCommand({ user, refreshToken });
    await this.commandBus.execute(command);
  }

  async revoke(refreshToken: string): Promise<void> {
    return this.signOut(refreshToken);
  }

  @Transactional()
  async askForRecoveryPassword(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    const command = new AskForRecoveryPasswordCommand(user);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  async verifyIfRecoveryPasswordTokenIsValid(
    token: string,
  ): Promise<{ isValid: boolean }> {
    try {
      const user = await this.userService.findUserByRecoveryToken(token);
      const isValid = user.isRecoveryPasswordTokenValid(token);
      return { isValid };
    } catch (error) {
      return { isValid: false };
    }
  }
}
