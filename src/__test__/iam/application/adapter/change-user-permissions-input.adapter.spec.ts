import { ChangeUserPermissionsInputAdapter } from '@iam/application/adapter';
import { Permission, PermissionEnum } from '@iam/domain/entities';
import { ChangeUserPermissionsInput } from '@iam/presentation/http/dto';

describe('change-user-permissions-input.adapter.spec', () => {
  let input: ChangeUserPermissionsInput;
  let adapter: ChangeUserPermissionsInputAdapter;

  beforeAll(async () => {
    adapter = new ChangeUserPermissionsInputAdapter();
  });

  beforeEach(() => {
    input = {
      userId: 'user-id',
      permissions: [
        {
          entity: '@iam',
          automation: PermissionEnum.AcessoGrupo,
          create: PermissionEnum.AcessoGrupo,
          delete: PermissionEnum.AcessoGrupo,
          read: PermissionEnum.AcessoGrupo,
          update: PermissionEnum.AcessoGrupo,
          import: PermissionEnum.AcessoGrupo,
          manage: PermissionEnum.AcessoGrupo,
          _export: PermissionEnum.AcessoGrupo,
        },
      ],
    };
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should return a permission array', () => {
    const result = adapter.build(input);
    expect(result).toBeInstanceOf(Array);
    result.forEach((permission, i) => {
      const permissionValue = permission.value;
      expect(permission).toBeInstanceOf(Permission);
      expect(input.permissions[i]).toMatchObject(permissionValue);
    });
  });

  it('should return a permission array with the same length as the input', () => {
    const result = adapter.build(input);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(input.permissions.length);
  });

  it('should return a empty array', () => {
    input.permissions = [];
    const result = adapter.build(input);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });
});
