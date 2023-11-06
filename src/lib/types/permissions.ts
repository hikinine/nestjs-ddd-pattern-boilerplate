export type PermissionActions =
  | 'Manage'
  | 'Create'
  | 'Read'
  | 'Update'
  | 'Delete'
  | 'Export'
  | 'Import';

const permissions: PermissionActions[] = [
  'Create',
  'Manage',
  'Read',
  'Update',
  'Delete',
  'Export',
  'Import',
];

export type PermissionEncoded =
  `@${Lowercase<PermissionModules>}:${Lowercase<PermissionActions>}`;

export type PermissionMapper = {
  [key in PermissionModules]: PermissionEncoded;
};
export type PermissionsState = {
  [key in PermissionActions]: PermissionMapper;
};

export type PermissionModules = 'Iam' | 'Sales' | 'Customer';

function generatePermissionsKey(
  modules: PermissionModules[],
): PermissionsState {
  return permissions.reduce((acc, permission) => {
    const permissionKey = modules.reduce((acc, module) => {
      const key = `@${module.toLowerCase()}:${permission.toLowerCase()}`;
      return {
        ...acc,
        [module]: key,
      };
    }, {} as PermissionMapper);

    return {
      ...acc,
      [permission]: permissionKey,
    };
  }, {} as PermissionsState);
}

export const PermissionTo = generatePermissionsKey([
  'Iam',
  'Sales',
  'Customer',
]);
