import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultGroupFactory } from '@app/__test__/__mock__/group-factory';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { DomainError } from '@hiki9/rich-domain/dist';
import { SubscribeUserToGroupCommandHandler } from '@iam/application/command';
import { SubscribeUserToGroupCommand } from '@iam/domain/command';
import { Group, User } from '@iam/domain/entities';
import { GroupRepository, UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorContextService, AuthorUserContext } from '@lib/common';
import { ForbiddenException, INestApplication } from '@nestjs/common';

describe('Command SubscribeUserToGroupCommand', () => {
  let app: INestApplication;
  let handler: SubscribeUserToGroupCommandHandler;
  let command: SubscribeUserToGroupCommand;
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
    handler = app.get(SubscribeUserToGroupCommandHandler);
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
    const userFactory = new CreateDefaultUserFactory(userRepository);
    const groupFactory = new CreateDefaultGroupFactory(groupRepository);

    user = await userFactory.execute({ isActive: true, groups: [] });
    group = await groupFactory.execute();

    command = new SubscribeUserToGroupCommand({
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

  afterEach(async () => {
    try {
      user.unsubscribeTo(group);
    } catch (error) {
      //ok
    } finally {
      await userRepository.update(user);
    }
  });

  describe('execute handler', () => {
    it('should be defined', () => {
      expect(handler).toBeDefined();
      expect(command).toBeDefined();
    });

    it('should check dependency injections', () => {
      expect(handler['context']).toBeInstanceOf(AuthorContextService);
      expect(handler['userRepository']).toBeDefined();
    });

    it('should subscribe user to group', async () => {
      await context.run(author, async () => {
        const { user, group } = command.props;
        expect(user.belongsToGroup(group)).toBeFalsy();
        const response = await handler.execute(command);
        expect(response).toBeUndefined();
        expect(user.belongsToGroup(group)).toBeTruthy();
      });
    });

    it('should throw error when user is already subscribed to group', async () => {
      await context.run(author, async () => {
        const command = new SubscribeUserToGroupCommand({
          user,
          group,
        });

        await handler.execute(command);
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
        const spyOnMethods1 = jest.spyOn(command.props.user, 'subscribeTo');
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
      const user = await userFactory.execute({ isActive: false, groups: [] });
      const command = new SubscribeUserToGroupCommand({
        user,
        group,
      });
      await context.run(author, async () => {
        await expect(handler.execute(command)).rejects.toBeInstanceOf(
          ForbiddenException,
        );
      });
    });
  });
});
