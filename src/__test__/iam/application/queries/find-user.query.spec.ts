import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultUserFactory } from '@app/__test__/__mock__/user-factory';
import { Pagination, PaginationCriteria } from '@hiki9/rich-domain/dist';
import { FindUserQueryHandler } from '@iam/application/queries';
import { Permission, User } from '@iam/domain/entities';
import { FindUserQuery } from '@iam/domain/queries';
import { UserRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { INestApplication } from '@nestjs/common';

describe('find-users query', () => {
  let app: INestApplication;
  let handler: FindUserQueryHandler;
  let user: User;
  let userRepository: UserRepository;
  let permissions: Permission[];

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(FindUserQueryHandler);
    userRepository = app.get(UserRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    permissions = [Permission.createFromBitmap('@iam.12232422')];
    const factory = new CreateDefaultUserFactory(userRepository);
    user = await factory.execute({ permissions });
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(user).toBeInstanceOf(User);
  });

  it('should verify createdAt, updatedAt', async () => {
    const query = new FindUserQuery({ email: user.email.value });
    const queryUser = (await handler.execute(query)) as User;
    expect(queryUser).toBeInstanceOf(User);

    expect(queryUser.createdBy).toEqual(user.createdBy);
    expect(queryUser.updatedBy).toEqual(user.updatedBy);
    expect(queryUser.createdAt).toEqual(user.createdAt);
    expect(queryUser.updatedAt).toEqual(user.updatedAt);
  });

  it('should return a user by name', async () => {
    const query = new FindUserQuery({ email: user.email.value });
    const queryUser = (await handler.execute(query)) as User;
    expect(queryUser).toBeInstanceOf(User);
    expect(queryUser.email).toEqual(user.email);
    expect(queryUser.email).toEqual(user.email);
    expect(queryUser.profile.phone).toEqual(user.profile.phone);
    expect(queryUser.permissions[0].bitmap).toEqual(user.permissions[0].bitmap);
    expect(queryUser.createdAt).toEqual(user.createdAt);
  });

  it('should return a user by id', async () => {
    const query = new FindUserQuery({ id: user.id.value });
    const queryUser = (await handler.execute(query)) as User;
    expect(queryUser).toBeInstanceOf(User);
    expect(queryUser.email).toEqual(user.email);
    expect(queryUser.profile.phone).toEqual(user.profile.phone);
    expect(queryUser.permissions[0].bitmap).toEqual(user.permissions[0].bitmap);
    expect(queryUser.createdAt).toEqual(user.createdAt);
  });

  it('should return a user collection by criteria', async () => {
    const criteria = new PaginationCriteria({ page: 0, size: 10 });
    const query = new FindUserQuery({ criteria });
    const users = (await handler.execute(query)) as Pagination<User>;
    const [firstUser] = users.result;
    expect(firstUser).toBeInstanceOf(User);
    expect(users).toBeInstanceOf(Pagination);
    expect(users.result).toBeInstanceOf(Array);
    expect(users.result.every((user) => user instanceof User)).toBeTruthy();
  });

  it('should returns null', async () => {
    const email = 'not-exist' + Math.random();
    const queryName = new FindUserQuery({ email });
    const queryUserName = await handler.execute(queryName);

    const id = 'not-exist' + Math.random();
    const queryId = new FindUserQuery({ id });
    const queryUserId = await handler.execute(queryId);

    expect(queryUserName).toBeNull();
    expect(queryUserId).toBeNull();
  });
});
