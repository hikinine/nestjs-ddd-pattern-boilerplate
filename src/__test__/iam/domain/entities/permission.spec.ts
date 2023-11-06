import { DomainError } from '@hiki9/rich-domain/dist';
import {
  Permission,
  PermissionEnum,
  PermissionProps,
} from '@iam/domain/entities';

describe('Permission entity', () => {
  let permissionProps: PermissionProps;

  beforeEach(() => {
    permissionProps = {
      entity: '@any',
      manage: PermissionEnum.AcessoPessoal,
      create: PermissionEnum.AcessoPessoal,
      read: PermissionEnum.AcessoTotal,
      update: PermissionEnum.AcessoGrupo,
      delete: PermissionEnum.AcessoPessoal,
      export: PermissionEnum.AcessoNegado,
      import: PermissionEnum.AcessoNegado,
      automation: PermissionEnum.AcessoNegado,
    };
  });
  it('should be defined', () => {
    expect(Permission).toBeDefined();
  });
  it('should create a permission', () => {
    const permission = new Permission(permissionProps);
    expect(permission).toBeInstanceOf(Permission);
    expect(permissionProps).toMatchObject(permission.value);
    expect(permissionProps.entity).toEqual(permission.entity);
  });

  it('should decode bitmap', () => {
    const permission = new Permission(permissionProps);
    const bitmap = permission.bitmap;
    const decodedProps = Permission.decodeBitmap(bitmap);
    expect(permissionProps).toMatchObject(decodedProps);
  });

  it('should create permission from bitmap', () => {
    const permissionFromBitmap = Permission.createFromBitmap('@any.11111111');
    expect(permissionFromBitmap).toBeInstanceOf(Permission);

    const permission = new Permission({
      entity: '@any',
      manage: 1,
      create: 1,
      read: 1,
      update: 1,
      delete: 1,
      export: 1,
      import: 1,
      automation: 1,
    });

    expect(permission).toBeInstanceOf(Permission);
    expect(permission.value).toEqual(permissionFromBitmap.value);
  });
  it('should create permission from bitmap of a created permission', () => {
    const permission = new Permission(permissionProps);
    const bitmap = permission.bitmap;
    const permissionFromBitmap = Permission.createFromBitmap(bitmap);
    expect(permissionFromBitmap).toBeInstanceOf(Permission);
    expect(permissionFromBitmap.value).toEqual(permission.value);
  });
  it('should throw invalid permission value', () => {
    permissionProps.manage = 10 as any;
    expect(() => new Permission(permissionProps)).toThrow(DomainError);
  });

  it('should throw invalid entity name', () => {
    permissionProps.entity = '' as any;
    expect(() => new Permission(permissionProps)).toThrow(DomainError);
    permissionProps.entity = 10 as any;
    expect(() => new Permission(permissionProps)).toThrow(DomainError);
    permissionProps.entity = undefined as any;
    expect(() => new Permission(permissionProps)).toThrow(DomainError);
    permissionProps.entity = null as any;
    expect(() => new Permission(permissionProps)).toThrow(DomainError);
  });

  it('should create a default permission with all AcessoNegado Value', () => {
    const permission = new Permission({ entity: '@any' });
    expect(permission).toBeInstanceOf(Permission);
    expect(permission.value.automation).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.create).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.read).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.update).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.delete).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.export).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.import).toBe(PermissionEnum.AcessoNegado);
    expect(permission.value.manage).toBe(PermissionEnum.AcessoNegado);
  });
});
