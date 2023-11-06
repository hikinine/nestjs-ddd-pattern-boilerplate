import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateUserProps } from '@app/__test__/__mock__/generate-user-props';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { SignOutCommandHandler } from '@iam/application/command';
import { SignOutCommand } from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { INestApplication } from '@nestjs/common';

describe('Command SignOutCommand', () => {
  let app: INestApplication;
  let handler: SignOutCommandHandler;
  let command: SignOutCommand;
  let refreshToken: string;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(SignOutCommandHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute(null, (user) => {
      const { token } = user.registerAnRefreshTokenAccess();
      refreshToken = token;
    });

    command = new SignOutCommand({
      user,
      refreshToken,
    });
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['userRepository']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should sign out', async () => {
      await expect(handler.execute(command)).resolves.toBeUndefined();
    });

    it('method update should be called only if refresh token exists', async () => {
      const spyOnMethods = jest.spyOn(handler['userRepository'], 'update');
      await expect(handler.execute(command)).resolves.toBeUndefined();
      expect(spyOnMethods).toBeCalledTimes(1);
    });

    it('method update should not be called', async () => {
      const userProps = generateUserProps();
      const user = new User(userProps);
      const command = new SignOutCommand({
        user,
        refreshToken: 'random-invalid-token',
      });

      const spyOnMethods = jest.spyOn(handler['userRepository'], 'update');
      await expect(handler.execute(command)).resolves.toBeUndefined();
      expect(spyOnMethods).not.toBeCalled();
    });

    it('ensure method revokeRefreshTokenIfExists was called', async () => {
      const spyOnMethods = jest.spyOn(
        command.props.user,
        'revokeRefreshTokenIfExists',
      );
      await expect(handler.execute(command)).resolves.toBeUndefined();
      expect(spyOnMethods).toBeCalledTimes(1);
      expect(spyOnMethods).toBeCalledWith(refreshToken);
    });
  });
});
