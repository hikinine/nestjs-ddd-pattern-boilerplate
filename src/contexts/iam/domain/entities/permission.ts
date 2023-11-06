import { Domain, DomainError } from '@hiki9/rich-domain';
import { permissionValidation } from './validation/permission';

export enum PermissionEnum {
  'AcessoNegado' = 1,
  'AcessoPessoal' = 2,
  'AcessoGrupo' = 3,
  'AcessoTotal' = 4,
}
export interface PermissionProps extends Domain.EntityProps {
  entity: string;
  read: PermissionEnum;
  manage: PermissionEnum;
  create: PermissionEnum;
  update: PermissionEnum;
  delete: PermissionEnum;
  automation: PermissionEnum;
  export: PermissionEnum;
  import: PermissionEnum;
}

export type PermissionBitmap =
  `${string}.${string}${string}${string}${string}${string}${string}${string}${number}`;

const hooks = Domain.Hooks<Permission, PermissionProps>({
  validation: permissionValidation,
  transformBeforeCreate: (props) => {
    props.update = props.update || PermissionEnum.AcessoNegado;
    props.delete = props.delete || PermissionEnum.AcessoNegado;
    props.automation = props.automation || PermissionEnum.AcessoNegado;
    props.export = props.export || PermissionEnum.AcessoNegado;
    props.import = props.import || PermissionEnum.AcessoNegado;
    props.read = props.read || PermissionEnum.AcessoNegado;
    props.create = props.create || PermissionEnum.AcessoNegado;
    props.manage = props.manage || PermissionEnum.AcessoNegado;

    return props;
  },
});

export class Permission extends Domain.Aggregate<PermissionProps> {
  protected static hooks = hooks;

  constructor(props: Partial<PermissionProps> & { entity: string }) {
    super(props as Required<PermissionProps>);
  }

  /**
   * Create a permission from a bitmap.
   * @example Permission.createFromBitmap('@my-entity.32111111')
   * @bitmap_parameter_order
   * EntityName
   * Manage
   * Create
   * Read
   * Update
   * Delete
   * Export
   * Import
   * Automation
   */
  public static createFromBitmap(bitmap: PermissionBitmap): Permission {
    const { module, permissions } = this.internalDecodeBitmap(bitmap);

    const [
      manage,
      create,
      read,
      update,
      _delete,
      _export,
      _import,
      automation,
    ] = permissions;

    return new Permission({
      entity: module,
      manage: manage as PermissionEnum,
      create: create as PermissionEnum,
      read: read as PermissionEnum,
      update: update as PermissionEnum,
      delete: _delete as PermissionEnum,
      export: _export as PermissionEnum,
      import: _import as PermissionEnum,
      automation: automation as PermissionEnum,
    });
  }

  /**
   * Decode the bitmap and mapping the permissions to their corresponding properties.
   * @param {PermissionBitmap} bitmap - The bitmap to be decoded.
   * @example Permission.decodeBitmap('@my-entity.11111111')
   * @returns an object of type PermissionProps.
   */
  public static decodeBitmap(bitmap: PermissionBitmap): PermissionProps {
    const { module, permissions } = this.internalDecodeBitmap(bitmap);

    const [
      manage,
      create,
      read,
      update,
      _delete,
      _export,
      _import,
      automation,
    ] = permissions;

    return {
      entity: module,
      manage: manage as PermissionEnum,
      create: create as PermissionEnum,
      read: read as PermissionEnum,
      update: update as PermissionEnum,
      delete: _delete as PermissionEnum,
      export: _export as PermissionEnum,
      import: _import as PermissionEnum,
      automation: automation as PermissionEnum,
    };
  }

  private static internalDecodeBitmap(bitmap: PermissionBitmap): {
    module: string;
    permissions: PermissionEnum[];
  } {
    if (!isBitmapLike(bitmap)) {
      throw new DomainError('Invalid bitmap');
    }
    const [module, bitmapPermissions] = bitmap.split('.');
    const permissions = bitmapPermissions
      .split('')
      .map((p) => Number(p) as PermissionEnum);

    return {
      module,
      permissions,
    };
  }

  get bitmap(): PermissionBitmap {
    const {
      entity,
      manage,
      create,
      read,
      update,
      delete: _delete,
      export: _export,
      import: _import,
      automation,
    } = this.props;

    return `${entity}.${manage}${create}${read}${update}${_delete}${_export}${_import}${automation}`;
  }

  get entity() {
    return this.props.entity;
  }

  get value() {
    return {
      manage: this.props.manage,
      read: this.props.read,
      create: this.props.create,
      update: this.props.update,
      delete: this.props.delete,
      automation: this.props.automation,
      export: this.props.export,
      import: this.props.import,
    };
  }
}

function isModuleLike(module: any): boolean {
  return typeof module === 'string' && module.length > 0;
}

function isPermissionLike(permission: any): boolean {
  return typeof permission === 'string' && permission.length === 8;
}
function isBitmapLike(bitmap: string) {
  const [module, permissions] = bitmap.split('.');
  return isModuleLike(module) && isPermissionLike(permissions);
}
