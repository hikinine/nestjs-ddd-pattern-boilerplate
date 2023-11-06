import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateUserProps } from '@app/__test__/__mock__/generate-user-props';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { Phone } from '@app/contexts/shared/domain';
import { DomainError, Id } from '@hiki9/rich-domain/dist/core';
import { UpdateUserBasicInfoCommandHandler } from '@iam/application/command';
import { UpdateUserBasicInfoCommand } from '@iam/domain/command';
import { User } from '@iam/domain/entities';
import { UserRepository } from '@iam/domain/repositories';
import { Username } from '@iam/domain/value-object';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('Command UpdateUserCommand', () => {
  let app: INestApplication;
  let handler: UpdateUserBasicInfoCommandHandler;
  let command: UpdateUserBasicInfoCommand;
  let context: AuthorContextService;
  let author: AuthorUserContext;
  let user: User;
  let userRepository: UserRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(UpdateUserBasicInfoCommandHandler);
    context = app.get(AuthorContextService);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const userFactory = new CreateDefaultUserFactory(userRepository);
    user = await userFactory.execute();
    command = new UpdateUserBasicInfoCommand(user, {
      phone: new Phone('(11) 11111-1111'),
      username: new Username(Math.random().toString()),
    });
    const userAuthor = new Author({
      id: user.id.value,
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
    it('should update an user', async () => {
      await context.run(author, async () => {
        const response = await handler.execute(command);
        expect(response).toBeUndefined();
      });
    });

    it('should throw an error when user not found', async () => {
      await context.run(author, async () => {
        const command = new UpdateUserBasicInfoCommand(
          new User(
            generateUserProps({
              id: new Id(randomUUID()),
            }),
          ),
          {
            phone: new Phone('(11) 11111-1111'),
            username: new Username(Math.random().toString()),
          },
        );
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          DomainError,
        );
      });
    });

    it('should change only username', async () => {
      const initialUsername = user.username.value;
      const initialPhone = user.phone.value;
      const newUsername = 'different-username' + Math.random();

      await context.run(author, async () => {
        const command = new UpdateUserBasicInfoCommand(user, {
          username: new Username(newUsername),
        });
        await expect(handler.execute(command)).resolves.toBeUndefined();
        expect(user.username.value).toEqual(newUsername);
        expect(user.username.value).not.toEqual(initialUsername);
        expect(user.phone.value).toEqual(initialPhone);
      });
    });

    it('should change only phone', async () => {
      const initialUsername = user.username.value;
      const initialPhone = user.phone.value;

      const newPhoneValue = '(44) 98765-1238';
      await context.run(author, async () => {
        const newCommand = new UpdateUserBasicInfoCommand(user, {
          phone: new Phone(newPhoneValue),
        });
        await expect(handler.execute(newCommand)).resolves.toBeUndefined();
        expect(user.username.value).toEqual(initialUsername);
        expect(user.phone.value).toEqual(newPhoneValue);
        expect(user.phone.value).not.toEqual(initialPhone);
      });
    });
  });
});
