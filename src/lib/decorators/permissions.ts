import { PERMS_KEY } from '@lib/constants';
import { PermissionEncoded } from '@lib/types';
import { SetMetadata } from '@nestjs/common';

export const RequiredPermissions = (
  perms: PermissionEncoded[] | PermissionEncoded,
) => {
  if (!Array.isArray(perms)) perms = [perms];

  return SetMetadata(PERMS_KEY, perms);
};
