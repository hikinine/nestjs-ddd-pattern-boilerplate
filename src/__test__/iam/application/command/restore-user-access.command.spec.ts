import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateUserProps } from '@app/__test__/__mock__/generate-user-props';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { ApplicationLevelError } from '@hiki9/rich-domain/dist';
import { RestoreUserAccessCommandHandler } from '@iam/application/command';
import { RestoreUserAccessCommand } from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { days } from '@lib/utils';
import { INestApplication } from '@nestjs/common';

describe('Command RestoreUserAccessCommand', () => {
  let app: INestApplication;
  let handler: RestoreUserAccessCommandHandler;
  let command: RestoreUserAccessCommand;
  let userRepository: UserRepository;

  let context: AuthorContextService;
  let authorContext: AuthorUserContext;
  let rootUser: User;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(RestoreUserAccessCommandHandler);
    userRepository = app.get(UserRepository);
    context = app.get<AuthorContextService>(AuthorContextService);

    rootUser = await userRepository.findByEmail('root@root.com');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const propsToAppend = { isActive: false };
    const factory = new CreateDefaultUserFactory(userRepository);
    const user = await factory.execute(propsToAppend);
    command = new RestoreUserAccessCommand(user);

    authorContext = {
      author: new Author({
        id: rootUser.id.value,
        exp: Date.now() + days(1),
        permissions: [],
      }),
    };
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', async () => {
    await context.run(authorContext, async () => {
      expect(handler['userRepository']).toBeDefined();
    });
  });
  describe('execute handler', () => {
    it('should restore user access', async () => {
      await context.run(authorContext, async () => {
        await expect(handler.execute(command)).resolves.toBeUndefined();
      });
    });

    it('should throw error when user is already active', async () => {
      await context.run(authorContext, async () => {
        const userProps = generateUserProps({
          isActive: true,
        });
        const user = new User(userProps);
        const command = new RestoreUserAccessCommand(user);
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ApplicationLevelError,
        );
      });
    });

    it('should ensure method update was called', async () => {
      await context.run(authorContext, async () => {
        const spyOnMethods = jest.spyOn(handler['userRepository'], 'update');
        await expect(handler.execute(command)).resolves.toBeUndefined();
        expect(spyOnMethods).toHaveBeenCalledWith(command.user);
      });
    });

    it('should ensure method restoreUserAccess', async () => {
      await context.run(authorContext, async () => {
        const spyOnMethods = jest.spyOn(command.user, 'restoreUserAccess');
        await expect(handler.execute(command)).resolves.toBeUndefined();
        expect(spyOnMethods).toBeCalledTimes(1);
      });
    });

    it('should throw if command props is wrong', async () => {
      await context.run(authorContext, async () => {
        const command = new RestoreUserAccessCommand(null);
        await expect(handler.execute(command)).rejects.toThrow();
      });
    });
  });
});
