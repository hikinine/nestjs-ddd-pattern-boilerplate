import { createTestingModule } from '@app/__test__/__mock__/create-testing-module';
import { CreateDefaultGroupFactory } from '@app/__test__/__mock__/group-factory';
import { Pagination, PaginationCriteria } from '@hiki9/rich-domain/dist';
import { FindGroupsQueryHandler } from '@iam/application/queries';
import { Group } from '@iam/domain/entities';
import { FindGroupsQuery } from '@iam/domain/queries';
import { GroupRepository } from '@iam/domain/repositories';
import { IamModule } from '@iam/iam.module';
import { INestApplication } from '@nestjs/common';

describe('find-groups query', () => {
  let app: INestApplication;
  let handler: FindGroupsQueryHandler;
  let group: Group;
  let groupRepository: GroupRepository;

  beforeAll(async () => {
    app = await createTestingModule({
      imports: [IamModule],
      override: [],
    });
    handler = app.get(FindGroupsQueryHandler);
    groupRepository = app.get(GroupRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const factory = new CreateDefaultGroupFactory(groupRepository);
    group = await factory.execute();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
    expect(group).toBeInstanceOf(Group);
  });

  it('should return a group by name', async () => {
    const query = new FindGroupsQuery({ groupName: group.name });
    const queryGroup = (await handler.execute(query)) as Group;
    expect(queryGroup).toBeInstanceOf(Group);
    expect(queryGroup.name).toBe(group.name);
    expect(queryGroup.isDepartment).toEqual(group.isDepartment);
    expect(queryGroup.permissions.length).toEqual(group.permissions.length);
    expect(queryGroup.permissions).toEqual(group.permissions);
  });

  it('should return a group by id', async () => {
    const query = new FindGroupsQuery({ groupId: group.id.value });
    const queryGroup = (await handler.execute(query)) as Group;
    expect(queryGroup).toBeInstanceOf(Group);
    expect(queryGroup.name).toBe(group.name);
    expect(queryGroup.isDepartment).toEqual(group.isDepartment);
    expect(queryGroup.permissions.length).toEqual(group.permissions.length);
    expect(queryGroup.permissions).toEqual(group.permissions);
  });

  it('should return a group collection by criteria', async () => {
    const criteria = new PaginationCriteria({ page: 0, size: 10 });
    const query = new FindGroupsQuery({ criteria });
    const groups = (await handler.execute(query)) as Pagination<Group>;
    const [firstGroup] = groups.result;
    expect(firstGroup).toBeInstanceOf(Group);
    expect(groups).toBeInstanceOf(Pagination);
    expect(groups.result).toBeInstanceOf(Array);
    expect(groups.result.every((group) => group instanceof Group)).toBeTruthy();
  });

  it('should verify createdAt, updatedAt', async () => {
    const query = new FindGroupsQuery({ groupId: group.id.value });
    const queryGroup = (await handler.execute(query)) as Group;
    expect(queryGroup).toBeInstanceOf(Group);

    expect(queryGroup.createdBy).toEqual(group.createdBy);
    expect(queryGroup.updatedBy).toEqual(group.updatedBy);
    expect(queryGroup.createdAt).toEqual(group.createdAt);
    expect(queryGroup.updatedAt).toEqual(group.updatedAt);
  });
  it('should returns null', async () => {
    const groupName = 'not-exist' + Math.random();
    const queryName = new FindGroupsQuery({ groupName });
    const queryGroupName = await handler.execute(queryName);

    const groupId = 'not-exist' + Math.random();
    const queryId = new FindGroupsQuery({ groupId });
    const queryGroupId = await handler.execute(queryId);

    expect(queryGroupName).toBeNull();
    expect(queryGroupId).toBeNull();
  });
});
