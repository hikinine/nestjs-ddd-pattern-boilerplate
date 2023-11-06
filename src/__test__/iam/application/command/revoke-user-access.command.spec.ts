import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateUserProps } from '@app/__test__/__mock__/generate-user-props';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { ApplicationLevelError } from '@hiki9/rich-domain/dist';
import { RevokeUserAccessCommandHandler } from '@iam/application/command';
import { RevokeUserAccessCommand } from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { INestApplication } from '@nestjs/common';

describe('Command RevokeUserAccessCommand', () => {
  let app: INestApplication;
  let handler: RevokeUserAccessCommandHandler;
  let command: RevokeUserAccessCommand;
  let context: AuthorContextService;
  let author: AuthorUserContext;
  let userRepository: UserRepository;
  let rootUser: User;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(RevokeUserAccessCommandHandler);
    context = app.get(AuthorContextService);
    userRepository = app.get(UserRepository);
    rootUser = await userRepository.findByUsername('root');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute();
    command = new RevokeUserAccessCommand(user);

    const userAuthor = new Author({
      id: rootUser.id.value,
      exp: Date.now() + 999,
      permissions: [],
    });
    author = {
      author: userAuthor,
      userAgent: 'random-user-agent',
    };
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
    expect(handler['userRepository']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should revoke user access', async () => {
      await context.run(author, async () => {
        const response = await handler.execute(command);
        expect(response).toBeUndefined();
        expect(command.user.isActive()).toBeFalsy();
      });
    });

    it('should ensure method update was called', async () => {
      const spyOnMethods = jest.spyOn(handler['userRepository'], 'update');
      await context.run(author, async () => {
        await handler.execute(command);
        expect(spyOnMethods).toBeCalledTimes(1);
      });
    });

    it('should throw error when user is already inactive', async () => {
      const userProps = generateUserProps({ isActive: false });
      const user = new User(userProps);
      const command = new RevokeUserAccessCommand(user);
      await context.run(author, async () => {
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ApplicationLevelError,
        );
      });
    });

    it('should ensure user methods was called', async () => {
      const user = command.user;
      await context.run(author, async () => {
        const spyOnMethod1 = jest.spyOn(user, 'revokeAllPermissions');
        const spyOnMethod2 = jest.spyOn(user, 'revokeUserAccess');
        const spyOnMethod3 = jest.spyOn(user, 'setAuthorChange');

        await handler.execute(command);
        expect(spyOnMethod1).toBeCalledTimes(1);
        expect(spyOnMethod2).toBeCalledTimes(1);
        expect(spyOnMethod3).toBeCalledTimes(1);
      });
    });
  });
});
