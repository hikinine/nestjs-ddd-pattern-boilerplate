import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { ChangeUserPermissionsCommandHandler } from '@iam/application/command';
import { ChangeUserPermissionsCommand } from '@iam/domain/command';
import { Permission, User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { ForbiddenException, INestApplication } from '@nestjs/common';

describe('Command ChangeUserPermissionsCommand', () => {
  let app: INestApplication;
  let handler: ChangeUserPermissionsCommandHandler;
  let command: ChangeUserPermissionsCommand;
  const originalUserPermission = '@iam.11111111';
  const permissionsToChange = '@iam.22211111';
  let context: AuthorContextService;
  let author: AuthorUserContext;
  let userRepository: UserRepository;
  let user: User;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(ChangeUserPermissionsCommandHandler);
    context = app.get(AuthorContextService);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const userPropsToAppend = {
      permissions: [Permission.createFromBitmap(originalUserPermission)],
    };
    const factory = new CreateDefaultUserFactory(userRepository);
    user = await factory.execute(userPropsToAppend);

    command = new ChangeUserPermissionsCommand({
      user,
      permissions: [Permission.createFromBitmap(permissionsToChange)],
    });
    const userAuthor = new Author({
      id: 'some-random-id',
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
    expect(handler['userRepository']).toBeDefined();
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
  });
  describe('execute handler', () => {
    it('should change user permissions', async () => {
      await context.run(author, async () => {
        await handler.execute(command);
        const { user } = command.props;
        const newPermissions = user.permissions;
        newPermissions.forEach((permission) => {
          expect(user.hasPermission(permission)).toBeTruthy();
        });
      });
    });

    it('should ensure domain method was being called', async () => {
      await context.run(author, async () => {
        const spy = jest.spyOn(command.props.user, 'changePermissions');
        await handler.execute(command);
        expect(spy).toBeCalledWith(command.props.permissions);
      });
    });

    it('should ensure that repository is saving', async () => {
      await context.run(author, async () => {
        const spy = jest.spyOn(handler['userRepository'], 'update');
        await handler.execute(command);
        expect(spy).toBeCalledTimes(1);
      });
    });

    it('should ensure that command returns void', async () => {
      await context.run(author, async () => {
        await expect(handler.execute(command)).resolves.toBeUndefined();
      });
    });

    it('should throw that i cant change my own permissions', async () => {
      const userAuthor = new Author({
        id: user.id.value,
        exp: Date.now() + 999,
        permissions: [],
      });
      author = {
        author: userAuthor,
        userAgent: 'random-user-agent',
      };

      await context.run(author, async () => {
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ForbiddenException,
        );
      });
    });
  });
});
