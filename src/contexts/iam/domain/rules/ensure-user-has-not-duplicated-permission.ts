import { DomainError } from '@hiki9/rich-domain/dist';
import { User } from '@iam/domain/entities';

export function ensureUserHasNotDuplicatedPermission(user: User) {
  function hasSomePermissionDuplicated() {
    const uniquePermissionList = [];
    return user.permissions.some((permission) => {
      if (uniquePermissionList.includes(permission.entity)) {
        return true;
      }
      uniquePermissionList.push(permission.entity);
      return false;
    });
  }

  if (hasSomePermissionDuplicated()) {
    throw new DomainError('User has duplicated permission');
  }
}
