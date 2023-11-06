import { ChangeGroupPermissionAdapter } from '@iam/application/adapter';
import { Permission, PermissionEnum } from '@iam/domain/entities';
import { ChangeGroupPermissionInput } from '@iam/presentation/http/dto';

describe('ChangeGroupPermissionAdapter', () => {
  let input: ChangeGroupPermissionInput;
  let adapter: ChangeGroupPermissionAdapter;

  beforeAll(async () => {
    adapter = new ChangeGroupPermissionAdapter();
  });

  beforeEach(() => {
    input = {
      groupId: 'groupId',
      name: 'name',
      isDepartment: true,
      permissions: [
        {
          automation: PermissionEnum.AcessoGrupo,
          create: PermissionEnum.AcessoGrupo,
          delete: PermissionEnum.AcessoGrupo,
          read: PermissionEnum.AcessoGrupo,
          update: PermissionEnum.AcessoGrupo,
          entity: 'entity',
          import: PermissionEnum.AcessoGrupo,
          manage: PermissionEnum.AcessoGrupo,
          export: PermissionEnum.AcessoGrupo,
        },
        {
          automation: PermissionEnum.AcessoGrupo,
          create: PermissionEnum.AcessoGrupo,
          delete: PermissionEnum.AcessoGrupo,
          read: PermissionEnum.AcessoGrupo,
          update: PermissionEnum.AcessoGrupo,
          entity: 'entity',
          import: PermissionEnum.AcessoGrupo,
          manage: PermissionEnum.AcessoGrupo,
          export: PermissionEnum.AcessoGrupo,
        },
        {
          automation: PermissionEnum.AcessoGrupo,
          create: PermissionEnum.AcessoGrupo,
          delete: PermissionEnum.AcessoGrupo,
          read: PermissionEnum.AcessoGrupo,
          update: PermissionEnum.AcessoGrupo,
          entity: 'entity',
          import: PermissionEnum.AcessoGrupo,
          manage: PermissionEnum.AcessoGrupo,
          export: PermissionEnum.AcessoGrupo,
        },
      ],
    };
  });

  it('should return an valid Group Props', () => {
    const props = adapter.build(input);
    expect(props.name).toBeDefined();
    expect(props.name).toEqual(input.name);
    expect(props.isDepartment).toBeDefined();
    expect(props.isDepartment).toEqual(input.isDepartment);
    expect(props.id).not.toBeDefined();
    expect(props.permissions.length).toEqual(input.permissions.length);
    props.permissions.map((permission, i) => {
      const permissionValue = permission.value;
      expect(permission).toBeInstanceOf(Permission);
      expect(input.permissions[i]).toMatchObject(permissionValue);
    });
  });

  it('should return an empty object', () => {
    const props = adapter.build({} as any);
    expect(props).toEqual({});
  });
  it('should return only name', () => {
    const input = {
      name: 'name',
    } as any;
    const props = adapter.build(input);

    expect(props.name).toBeDefined();
  });
});
