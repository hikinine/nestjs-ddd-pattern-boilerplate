import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultGroupFactory } from '@app/__test__/__mock__/group-factory';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import {
  ApplicationLevelError,
  DomainError,
  Pagination,
  PaginationCriteria,
} from '@hiki9/rich-domain/dist';
import { ItemNotFound } from '@hiki9/rich-domain/dist/core';
import { UserService } from '@iam/application/service';
import { PermissionEnum, User } from '@iam/domain/entities';
import { GroupRepository, UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import {
  ChangeUserPermissionsInput,
  SubscribeUserToGroupInput,
  UnsubscribeUserToGroupInput,
} from '@iam/presentation/http/dto';
import { Author, AuthorContextService, AuthorUserContext } from '@lib/common';
import { days } from '@lib/utils/time';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

describe('user service', () => {
  let app: INestApplication;
  let context: AuthorContextService;
  let authorContext: AuthorUserContext;
  let userService: UserService;
  let userRepository: UserRepository;
  let groupRepository: GroupRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
    });
    userService = app.get<UserService>(UserService);
    context = app.get<AuthorContextService>(AuthorContextService);
    groupRepository = app.get<GroupRepository>(GroupRepository);
    userRepository = app.get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    authorContext = {
      author: new Author({
        id: 'user-test',
        exp: Date.now() + days(1),
        permissions: [],
      }),
    };
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SubscribeToGroup method', () => {
    let input: SubscribeUserToGroupInput;

    beforeEach(async () => {
      const userFactory = new CreateDefaultUserFactory(userRepository);
      const groupFactory = new CreateDefaultGroupFactory(groupRepository);

      const group = await groupFactory.execute();
      const user = await userFactory.execute({ groups: [] });

      input = {
        userId: user.id.value,
        groupId: group.id.value,
      };
    });

    it('should subscribe user to group', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.subscribeToGroup(input),
        ).resolves.toBeUndefined();
      });
    });

    it('should throw that user is already subscribed to the group', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.subscribeToGroup(input),
        ).resolves.toBeUndefined();

        await expect(
          userService.subscribeToGroup(input),
        ).rejects.toBeInstanceOf(DomainError);
      });
    });

    it('should throw, user not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.subscribeToGroup({ ...input, userId: randomUUID() }),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });

    it('should throw, group not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.subscribeToGroup({ ...input, groupId: randomUUID() }),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });
  });

  describe('UnSubscribeToGroup method', () => {
    let input: UnsubscribeUserToGroupInput;

    beforeEach(async () => {
      const userFactory = new CreateDefaultUserFactory(userRepository);
      const groupFactory = new CreateDefaultGroupFactory(groupRepository);

      const group = await groupFactory.execute();
      const user = await userFactory.execute({ groups: [group] });

      input = {
        userId: user.id.value,
        groupId: group.id.value,
      };
    });

    it('should unsubscribe user to group', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.unsubscribeToGroup(input),
        ).resolves.toBeUndefined();
      });
    });

    it('should throw that user is not in the group', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.unsubscribeToGroup(input),
        ).resolves.toBeUndefined();

        await expect(
          userService.unsubscribeToGroup(input),
        ).rejects.toBeInstanceOf(DomainError);
      });
    });

    it('should throw, user not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.unsubscribeToGroup({ ...input, userId: randomUUID() }),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });

    it('should throw, group not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.unsubscribeToGroup({ ...input, groupId: randomUUID() }),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });
  });

  describe('changeUserPermissions method', () => {
    let input: ChangeUserPermissionsInput;
    let user: User;
    beforeEach(async () => {
      const userFactory = new CreateDefaultUserFactory(userRepository);
      user = await userFactory.execute({ permissions: [] });
    });

    it('should change user permissions', async () => {
      await context.run(authorContext, async () => {
        const permissionIam = {
          entity: '@iam',
          automation: PermissionEnum.AcessoPessoal,
          create: PermissionEnum.AcessoPessoal,
          read: PermissionEnum.AcessoPessoal,
          update: PermissionEnum.AcessoTotal,
          delete: PermissionEnum.AcessoPessoal,
          _export: PermissionEnum.AcessoNegado,
          import: PermissionEnum.AcessoPessoal,
          manage: PermissionEnum.AcessoPessoal,
        } as const;

        const permissionVehicle = {
          entity: '@sales',
          automation: PermissionEnum.AcessoTotal,
          create: PermissionEnum.AcessoNegado,
          read: PermissionEnum.AcessoPessoal,
          update: PermissionEnum.AcessoTotal,
          delete: PermissionEnum.AcessoPessoal,
          _export: PermissionEnum.AcessoNegado,
          import: PermissionEnum.AcessoTotal,
          manage: PermissionEnum.AcessoPessoal,
        } as const;

        input = {
          userId: user.id.value,
          permissions: [permissionIam, permissionVehicle],
        };

        await expect(
          userService.changeUserPermissions(input),
        ).resolves.toBeUndefined();

        const resultUser = await userService.findUserById(user.id.value);
        const P_IAM = resultUser.permissions.find((p) => p.entity === '@iam');
        const P_VEHICLE = resultUser.permissions.find(
          (p) => p.entity === '@sales',
        );

        expect(P_IAM.value.automation).toEqual(permissionIam.automation);
        expect(P_IAM.value.create).toEqual(permissionIam.create);
        expect(P_IAM.value.read).toEqual(permissionIam.read);
        expect(P_IAM.value.update).toEqual(permissionIam.update);
        expect(P_IAM.value.delete).toEqual(permissionIam.delete);
        expect(P_IAM.value.export).toEqual(permissionIam._export);
        expect(P_IAM.value.import).toEqual(permissionIam.import);
        expect(P_IAM.value.manage).toEqual(permissionIam.manage);

        expect(P_VEHICLE.value.automation).toEqual(
          permissionVehicle.automation,
        );
        expect(P_VEHICLE.value.create).toEqual(permissionVehicle.create);
        expect(P_VEHICLE.value.read).toEqual(permissionVehicle.read);
        expect(P_VEHICLE.value.update).toEqual(permissionVehicle.update);
        expect(P_VEHICLE.value.delete).toEqual(permissionVehicle.delete);
        expect(P_VEHICLE.value.export).toEqual(permissionVehicle._export);
        expect(P_VEHICLE.value.import).toEqual(permissionVehicle.import);
        expect(P_VEHICLE.value.manage).toEqual(permissionVehicle.manage);
      });
    });

    it('should change user permissions', async () => {
      await context.run(authorContext, async () => {
        const permissionIam = {
          entity: '@iam',
          automation: PermissionEnum.AcessoPessoal,
          create: PermissionEnum.AcessoPessoal,
          read: PermissionEnum.AcessoPessoal,
          update: PermissionEnum.AcessoTotal,
          delete: PermissionEnum.AcessoPessoal,
          _export: PermissionEnum.AcessoNegado,
          import: PermissionEnum.AcessoPessoal,
          manage: PermissionEnum.AcessoPessoal,
        } as const;

        input = {
          userId: user.id.value,
          permissions: [permissionIam],
        };

        await expect(
          userService.changeUserPermissions(input),
        ).resolves.toBeUndefined();

        let resultUser: User;
        resultUser = await userService.findUserById(user.id.value);

        const P_IAM = resultUser.permissions.find((p) => p.entity === '@iam');
        expect(P_IAM.value.automation).toEqual(permissionIam.automation);
        expect(P_IAM.value.create).toEqual(permissionIam.create);
        expect(P_IAM.value.read).toEqual(permissionIam.read);
        expect(P_IAM.value.update).toEqual(permissionIam.update);
        expect(P_IAM.value.delete).toEqual(permissionIam.delete);
        expect(P_IAM.value.export).toEqual(permissionIam._export);
        expect(P_IAM.value.import).toEqual(permissionIam.import);
        expect(P_IAM.value.manage).toEqual(permissionIam.manage);

        await expect(
          userService.changeUserPermissions({
            userId: user.id.value,
            permissions: [],
          }),
        ).resolves.toBeUndefined();

        resultUser = await userService.findUserById(user.id.value);
        expect(resultUser.permissions.length).toEqual(0);
      });
    });

    it('should throw invalid permission', async () => {
      await context.run(authorContext, async () => {
        const permissionIam = {
          entity: '@iam2' as any,
          automation: PermissionEnum.AcessoPessoal,
          create: PermissionEnum.AcessoPessoal,
          read: PermissionEnum.AcessoPessoal,
          update: PermissionEnum.AcessoTotal,
          delete: PermissionEnum.AcessoPessoal,
          _export: PermissionEnum.AcessoNegado,
          import: PermissionEnum.AcessoPessoal,
          manage: PermissionEnum.AcessoPessoal,
        } as const;

        input = {
          userId: user.id.value,
          permissions: [permissionIam],
        };

        await expect(
          userService.changeUserPermissions(input),
        ).rejects.toBeDefined();
      });
    });
  });

  describe('removeUserAccess method', () => {
    let user: User;
    beforeEach(async () => {
      const userFactory = new CreateDefaultUserFactory(userRepository);
      user = await userFactory.execute({ isActive: true });
    });

    it('should remove user access', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.removeUserAccess(user.id.value),
        ).resolves.toBeUndefined();

        const resultUser = await userService.findUserById(user.id.value);
        expect(resultUser.active).toBeFalsy();
      });
    });

    it('should throw user not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.removeUserAccess('invalid-id'),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });

    it('should throw user already removed', async () => {
      await context.run(authorContext, async () => {
        await userService.removeUserAccess(user.id.value);
        await expect(
          userService.removeUserAccess(user.id.value),
        ).rejects.toBeInstanceOf(ApplicationLevelError);
      });
    });
  });

  describe('Find User Methods', () => {
    let user: User;
    let authorContext: AuthorUserContext;
    beforeEach(async () => {
      const userFactory = new CreateDefaultUserFactory(userRepository);
      user = await userFactory.execute({ permissions: [] });

      const author = new Author({
        id: user.id.value,
        exp: Date.now() + days(1),
        permissions: [],
      });
      authorContext = {
        author,
        userAgent: '',
      };
    });

    it('get my own profile', async () => {
      await context.run(authorContext, async () => {
        const resultUser = await userService.getMyOwnProfile();
        expect(resultUser).toBeInstanceOf(User);
        expect(resultUser.id.value).toEqual(user.id.value);
      });
    });

    it('should throw if user context was not provided', async () => {
      await expect(userService.getMyOwnProfile()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw if user not found', async () => {
      const author = new Author({
        id: 'invalid-id',
        exp: Date.now() + days(1),
        permissions: [],
      });
      const authorContext = {
        author,
        userAgent: '',
      };
      await context.run(authorContext, async () => {
        await expect(userService.getMyOwnProfile()).rejects.toBeInstanceOf(
          ItemNotFound,
        );
      });
    });

    it('should get user by id', async () => {
      await context.run(authorContext, async () => {
        const resultUser = await userService.findUserById(user.id.value);
        expect(resultUser.id.value).toEqual(user.id.value);
      });
    });

    it('should throw user not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.findUserById('invalid-id'),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });

    it('should get user by email', async () => {
      await context.run(authorContext, async () => {
        const resultUser = await userService.findUserByEmail(user.email.value);
        expect(resultUser.id.value).toEqual(user.id.value);
        expect(resultUser.email.value).toEqual(user.email.value);
      });
    });

    it('should throw user not found', async () => {
      await context.run(authorContext, async () => {
        await expect(
          userService.findUserByEmail('invalid-email'),
        ).rejects.toBeInstanceOf(ItemNotFound);
      });
    });

    it('should get overview user', async () => {
      await context.run(authorContext, async () => {
        const pagination = new PaginationCriteria({ limit: 10, offset: 0 });
        const paginationUser = await userService.overview(pagination);
        expect(paginationUser).toBeInstanceOf(Pagination);
        paginationUser.result.forEach((user) =>
          expect(user).toBeInstanceOf(User),
        );
      });
    });

    it('should throw invalid criteria', async () => {
      await context.run(authorContext, async () => {
        const pagination = {} as any;
        await expect(userService.overview(pagination)).rejects.toBeInstanceOf(
          ApplicationLevelError,
        );
      });
    });
  });
});
