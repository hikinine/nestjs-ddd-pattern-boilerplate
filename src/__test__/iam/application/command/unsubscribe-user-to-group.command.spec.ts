import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { generateUserProps } from '@app/__test__/__mock__/generate-user-props';
import { CreateDefaultGroupFactory } from '@app/__test__/__mock__/group-factory';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { DomainError } from '@hiki9/rich-domain/dist';
import { UnsubscribeUserToGroupCommandHandler } from '@iam/application/command';
import { UnsubscribeUserToGroupCommand } from '@iam/domain/command';
import { Group, User } from '@iam/domain/entities';
import { GroupRepository, UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorUserContext } from '@lib/domain';
import { AuthorContextService } from '@lib/provider';
import { ForbiddenException, INestApplication } from '@nestjs/common';

describe('Command UnsubscribeUserToGroupCommand', () => {
  let app: INestApplication;
  let handler: UnsubscribeUserToGroupCommandHandler;
  let command: UnsubscribeUserToGroupCommand;
  let context: AuthorContextService;
  let author: AuthorUserContext;
  let user: User;
  let group: Group;
  let userRepository: UserRepository;
  let groupRepository: GroupRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(UnsubscribeUserToGroupCommandHandler);
    context = app.get(AuthorContextService);
    userRepository = app.get(UserRepository);
    groupRepository = app.get(GroupRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const groupFactory = new CreateDefaultGroupFactory(groupRepository);
    const userFactory = new CreateDefaultUserFactory(userRepository);

    group = await groupFactory.execute();
    const userWithGroup = { isActive: true, groups: [group] };
    user = await userFactory.execute(userWithGroup);

    command = new UnsubscribeUserToGroupCommand({
      user,
      group,
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
    expect(handler['groupRepository']).toBeDefined();
  });
  describe('execute handler', () => {
    it('should unsubscribe user to group', async () => {
      await context.run(author, async () => {
        const { user, group } = command.props;
        expect(user.belongsToGroup(group)).toBeTruthy();
        const response = await handler.execute(command);
        expect(response).toBeUndefined();
        expect(user.belongsToGroup(group)).toBeFalsy();
      });
    });

    it('should throw error when user is doesnt belong to group', async () => {
      await context.run(author, async () => {
        const userProps = generateUserProps({
          groups: [],
        });
        const user = new User(userProps);
        const command = new UnsubscribeUserToGroupCommand({
          user,
          group,
        });

        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          DomainError,
        );
      });
    });

    it('should ensure method update was called', async () => {
      await context.run(author, async () => {
        const spyOnMethods = jest.spyOn(handler['userRepository'], 'update');
        await handler.execute(command);
        expect(spyOnMethods).toBeCalledTimes(1);
      });
    });

    it('should ensure that user methods was called', async () => {
      await context.run(author, async () => {
        const spyOnMethods1 = jest.spyOn(command.props.user, 'unsubscribeTo');
        const spyOnMethods2 = jest.spyOn(command.props.user, 'setAuthorChange');
        await handler.execute(command);
        expect(spyOnMethods1).toBeCalledTimes(1);
        expect(spyOnMethods1).toBeCalledWith(command.props.group);
        expect(spyOnMethods2).toBeCalledTimes(1);
        expect(spyOnMethods2).toBeCalledWith(author.author.id);
      });
    });

    it('should ensure that event was added to user queue', async () => {
      await context.run(author, async () => {
        const spyOnMethods = jest.spyOn(command.props.user, 'addEvent');
        await handler.execute(command);
        expect(spyOnMethods).toBeCalledTimes(1);
        expect(user.hasEvent('UserJoinedOrLeftAnGroupEvent')).toBeTruthy();
      });
    });

    it('should throw if user is not active', async () => {
      const userFactory = new CreateDefaultUserFactory(userRepository);
      const user = await userFactory.execute({ isActive: false });
      await context.run(author, async () => {
        const command = new UnsubscribeUserToGroupCommand({
          user,
          group,
        });

        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ForbiddenException,
        );
      });
    });
  });
});
