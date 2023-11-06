import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultGroupFactory } from '@app/__test__/__mock__/group-factory';
import { ChangeGroupPermissionCommandHandler } from '@iam/application/command';
import { ChangeGroupPermissionCommand } from '@iam/domain/command';
import { Group, GroupProps, Permission } from '@iam/domain/entities';
import { GroupRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { Author, AuthorContextService, AuthorUserContext } from '@lib/common';
import { INestApplication } from '@nestjs/common';

describe('change-group-permission.command.spec', () => {
  let app: INestApplication;
  let handler: ChangeGroupPermissionCommandHandler;
  let command: ChangeGroupPermissionCommand;
  let group: Group;
  let propsToChange: Partial<GroupProps>;
  let context: AuthorContextService;
  let author: AuthorUserContext;
  let groupRepository: GroupRepository;

  const defaultPermissions = ['@iam.00000000'];
  const authorId = '123';

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(ChangeGroupPermissionCommandHandler);
    context = app.get(AuthorContextService);
    groupRepository = app.get(GroupRepository);
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultGroupFactory(groupRepository);
    group = await factory.execute();

    propsToChange = {
      name: 'group' + Math.random(),
      isDepartment: true,
      permissions: [Permission.createFromBitmap('@iam.11111111')],
    };
    command = new ChangeGroupPermissionCommand({ group, propsToChange });

    author = {
      author: new Author({
        id: authorId,
        permissions: defaultPermissions,
        exp: 0,
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(command).toBeDefined();
    expect(group).toBeDefined();
  });

  it('should ensure  is defined', () => {
    expect(handler['groupRepository']).toBeDefined();
    expect(handler['context']).toBeInstanceOf(AuthorContextService);
  });

  describe('execute handler', () => {
    it('should change group permission', async () => {
      await context.run(author, async () => {
        const spyOn = jest.spyOn(handler['groupRepository'], 'update');
        const response = await handler.execute(command);
        expect(response).toBeUndefined();
        expect(spyOn).toBeCalledTimes(1);
      });
    });

    it('should ensure setAuthor was called ', async () => {
      const spyOnAuthor = jest.spyOn(group, 'setAuthorChange');
      await context.run(author, async () => {
        await handler.execute(command);
        expect(spyOnAuthor).toBeCalledTimes(1);
      });
    });

    it('should update only perm and name', async () => {
      const spyOnPerm = jest.spyOn(group, 'changePermissions');
      const spyOnName = jest.spyOn(group, 'changeName');
      const spyOnIsDpt = jest.spyOn(group, 'changeIsDepartment');

      const command = new ChangeGroupPermissionCommand({
        group,
        propsToChange: {
          permissions: [Permission.createFromBitmap('@iam.11111111')],
          name: 'new name' + Math.random(),
        },
      });
      await context.run(author, async () => {
        await handler.execute(command);
        expect(spyOnPerm).toBeCalledTimes(1);
        expect(spyOnName).toBeCalledTimes(1);
        expect(spyOnIsDpt).not.toBeCalled();
      });
    });
    it('should update only department status', async () => {
      const spyOnPermission = jest.spyOn(group, 'changePermissions');
      const spyOnName = jest.spyOn(group, 'changeName');
      const spyOnIsDpt = jest.spyOn(group, 'changeIsDepartment');

      const command = new ChangeGroupPermissionCommand({
        group,
        propsToChange: {
          isDepartment: true,
        },
      });
      await context.run(author, async () => {
        await handler.execute(command);
        expect(spyOnPermission).not.toBeCalled();
        expect(spyOnName).not.toBeCalled();
        expect(spyOnIsDpt).toBeCalled();
      });
    });
  });
});
