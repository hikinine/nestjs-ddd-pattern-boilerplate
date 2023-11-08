import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateUserProps } from '@app/__test__/__mock__/generate-user-props';
import { CreateUserCommandHandler } from '@iam/application/command';
import { CreateUserCommand } from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { IsUserExistsDomainService } from '@iam/domain/service';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorContextService, AuthorUserContext } from '@lib/common';
import { ConflictException, INestApplication } from '@nestjs/common';

describe('Command CreateUserCommand', () => {
  let app: INestApplication;
  let handler: CreateUserCommandHandler;
  let command: CreateUserCommand;
  let context: AuthorContextService;
  let author: AuthorUserContext;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(CreateUserCommandHandler);
    context = app.get(AuthorContextService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const user = new User(generateUserProps());
    command = new CreateUserCommand({ user });

    author = {
      author: new Author({
        id: '123',
        permissions: [],
        exp: 0,
      }),
      userAgent: 'test',
    };
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
  });

  it('should check dependency injections', () => {
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
    expect(handler['isUserExistsDomainService']).toBeInstanceOf(
      IsUserExistsDomainService,
    );
    expect(handler['userRepository']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should create a new user', async () => {
      await context.run(author, async () => {
        await expect(handler.execute(command)).resolves.toBeUndefined();
      });
    });

    it('should throw error if user already exists', async () => {
      await context.run(author, async () => {
        await expect(handler.execute(command)).resolves.toBeUndefined();
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ConflictException,
        );
      });
    });

    it('should ensure create was called', async () => {
      await context.run(author, async () => {
        const spyOnCreate = jest.spyOn(handler['userRepository'], 'create');
        await handler.execute(command);
        expect(spyOnCreate).toBeCalledTimes(1);
      });
    });

    it('should ensure isUserExistsDomainService was called', async () => {
      await context.run(author, async () => {
        const spyOnIsUserExists = jest.spyOn(
          handler['isUserExistsDomainService'],
          'execute',
        );
        await handler.execute(command);
        expect(spyOnIsUserExists).toBeCalledTimes(1);
        expect(spyOnIsUserExists).toBeCalledWith(
          command.props.user.email.value,
        );
      });
    });

    it('should ensure user is active', async () => {
      await context.run(author, async () => {
        command.props.user.revokeUserAccess();
        await handler.execute(command);
        expect(command.props.user.isActive()).toBeTruthy();
      });
    });
  });
});
