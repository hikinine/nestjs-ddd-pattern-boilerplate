export function RequiredPermissions(...perms: string[]) {
  return function (target: any, property: any, descriptor: any) {
    descriptor.__metadata__ = descriptor.__metadata__ || { permissions: [] };
    descriptor.__metadata__.permissions.push(...perms);
    Reflect.defineMetadata(
      `@permission.${property}`,
      descriptor.__metadata__.permissions,
      target,
    );

    return descriptor;
  };
}
