import { Permission, User } from '@iam/domain/entities';

export interface ChangeUserPermissionsCommandProps {
  user: User;
  permissions: Permission[];
}
/**
 * Change user permissions.
 * @param user {User}
 * @param permissions {Permission[]}
 */
export class ChangeUserPermissionsCommand {
  constructor(public readonly props: ChangeUserPermissionsCommandProps) {}
}
