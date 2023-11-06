import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { DomainError } from '@hiki9/rich-domain/dist';
import { AuthenticateUserWithRefreshTokenCommandHandler } from '@iam/application/command';
import { AuthenticateUserWithRefreshTokenCommand } from '@iam/domain/command';
import { RefreshToken, User } from '@iam/domain/entities';
import { AuthenticateStrategyPolicy } from '@iam/domain/policies';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { INestApplication } from '@nestjs/common';

describe('authenticate-user-with-refresh-token.command.spec', () => {
  let app: INestApplication;
  let handler: AuthenticateUserWithRefreshTokenCommandHandler;
  let command: AuthenticateUserWithRefreshTokenCommand;
  let userRepository: UserRepository;
  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(AuthenticateUserWithRefreshTokenCommandHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    let refreshToken: RefreshToken;
    const afterUserCreate = (user: User) => {
      refreshToken = user.registerAnRefreshTokenAccess();
    };

    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute(undefined, afterUserCreate);

    command = new AuthenticateUserWithRefreshTokenCommand(
      user,
      refreshToken.token,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should ensure that strategy is defined', () => {
    expect(handler['authenticateStrategyPolicy']).toBeInstanceOf(
      AuthenticateStrategyPolicy,
    );

    expect(handler['userRepository']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should return a sign in token', async () => {
      const signInToken = await handler.execute(command);
      expect(signInToken).toBeDefined();
      expect(typeof signInToken.value.accessToken).toEqual('string');
      expect(typeof signInToken.value.refreshToken).toEqual('string');
    });

    it('should throw an invalid refreshToken provided', async () => {
      const invalidCommand = new AuthenticateUserWithRefreshTokenCommand(
        command.user,
        'invalid-refresh-token',
      );
      await expect(handler.execute(invalidCommand)).rejects.toBeInstanceOf(
        DomainError,
      );
    });

    it('should throw an invalid user provided', async () => {
      const invalidCommand = new AuthenticateUserWithRefreshTokenCommand(
        {} as any,
        command.refreshToken,
      );
      await expect(handler.execute(invalidCommand)).rejects.toBeDefined();
    });

    it('should throw an invalid command', async () => {
      await expect(handler.execute(undefined as any)).rejects.toBeDefined();
    });

    it('should throw an invalid command', async () => {
      await expect(handler.execute({} as any)).rejects.toBeDefined();
    });

    it('should ensure repository is being used', async () => {
      const spy = jest.spyOn(handler['userRepository'], 'update');
      await handler.execute(command);
      expect(spy).toBeCalled();
    });

    it('should ensure user method is being used', async () => {
      const spy = jest.spyOn(
        command.user,
        'signInWithStrategyUsingRefreshToken',
      );
      await handler.execute(command);
      expect(spy).toBeCalled();
    });
  });
});
