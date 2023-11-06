import { DomainError } from '@hiki9/rich-domain/dist';
import { CreateGroupWithPermissionsAdapter } from '@iam/application/adapter';
import { Group, Permission, PermissionEnum } from '@iam/domain/entities';
import { CreateGroupWithPermissionsInput } from '@iam/presentation/http/dto';

describe('create-group-with-permissions.adapter.spec', () => {
  let input: CreateGroupWithPermissionsInput;
  let adapter: CreateGroupWithPermissionsAdapter;

  beforeAll(async () => {
    adapter = new CreateGroupWithPermissionsAdapter();
  });

  beforeEach(() => {
    input = {
      isDepartment: false,
      name: 'group-name',
      permissions: [],
    };
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should create an valid GroupProps', () => {
    const props = adapter.build(input);
    expect(props.name).toEqual(input.name);
    expect(props.isDepartment).toEqual(input.isDepartment);
    expect(props.permissions).toBeInstanceOf(Array);
    props.permissions.forEach((permission, i) => {
      expect(permission).toBeInstanceOf(Permission);
      expect(permission.entity).toEqual(input.permissions[i].entity);
    });
  });

  it('should create an Group based on GroupProps', () => {
    const props = adapter.build(input);
    const group = new Group(props);
    expect(group).toBeInstanceOf(Group);
    expect(group.name).toEqual(input.name);
    expect(group.isDepartment).toEqual(input.isDepartment);
    expect(group.permissions).toMatchObject(props.permissions);
  });

  it('expect to throw an error when input is invalid', () => {
    input.permissions.push({
      entity: '@iam',
      automation: PermissionEnum.AcessoGrupo,
      create: PermissionEnum.AcessoGrupo,
      delete: PermissionEnum.AcessoGrupo,
      read: 'wrong-permission' as any,
      update: PermissionEnum.AcessoGrupo,
      import: PermissionEnum.AcessoGrupo,
      manage: PermissionEnum.AcessoGrupo,
      _export: PermissionEnum.AcessoGrupo,
    });
    expect(() => adapter.build(input)).toThrow(DomainError);
  });
});
