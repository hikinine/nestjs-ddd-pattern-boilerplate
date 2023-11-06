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

  /**
   * function that signs in a user with a basic authentication method and generates
   * access and refresh tokens.
   * @param {string} username - A string representing the username of the user trying to sign in.
   * @param {string} password - The password parameter is a string that represents the user's password.
   * @param {boolean} [keepMeLoggedIn] - An optional boolean parameter that determines whether the user
   * wants to stay logged in or not. If set to true, a refresh token will be generated along with the
   * access token.
   * @returns SignInToken
   */
  async signInWithBasic(
    username: string,
    password: string,
    keepMeLoggedIn?: boolean,
  ): Promise<SignInToken> {
    const user = await this.userService.findUserByUsername(username);
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

  /**
   * This function signs in a user using their refresh token.
   * @param {string} refreshToken - A string representing the refresh token used to authenticate the
   * user.
   * @returns signInToken
   */
  async signInUsingRefreshToken(refreshToken: string): Promise<SignInToken> {
    const user = await this.userService.findUserByRefreshToken(refreshToken);
    const command = new AuthenticateUserWithRefreshTokenCommand(
      user,
      refreshToken,
    );
    const signInToken: SignInToken = await this.commandBus.execute(command);
    return signInToken;
  }

  /**
   * This function recovers a user's password using a recovery token and returns a sign-in token.
   * @param {string} token - A string representing the recovery password token that was sent to the
   * user's email for resetting their password.
   * @param {string} password - The new password that the user wants to set for their account.
   * @returns SignInToken
   */
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
    const username = user.username.value;
    const keepMeLoggedIn = true;
    const command = new RecoveryPasswordCommand({ user, password, token });
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
    const signInToken = await this.signInWithBasic(
      username,
      password,
      keepMeLoggedIn,
    );

    return signInToken;
  }

  /**
   * Signs out a user by revoking their refresh token from the database if exists.
   * @param {string} [refreshToken] - The `refreshToken` parameter is an optional string that represents
   * the refresh token associated with the user's session.
   */
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

  /**
   * Same behaviour as signOut
   * @param refreshToken
   * @returns void
   */
  async revoke(refreshToken: string): Promise<void> {
    return this.signOut(refreshToken);
  }

  /**
   * Asks for a recovery password for a user with a given email.
   * @param {string} email - A string representing the email address of the user who needs to recover
   * their password.
   */
  @Transactional()
  async askForRecoveryPassword(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);
    const command = new AskForRecoveryPasswordCommand(user);
    await this.commandBus.execute(command);
    await user.dispatchAll(this.publisher);
  }

  /**
   * Checks if a recovery password token is valid by
   * finding the user associated with the token.
   * @param {string} token - A string representing the recovery password token that needs to be verified.
   * @returns an object with a property "isValid" which is a boolean value.
   */
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
