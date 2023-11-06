import { Group, GroupProps } from '@iam/domain/entities';

export interface ChangeGroupPermissionCommandProps {
  group: Group;
  propsToChange: Partial<GroupProps>;
}
/**
 * Change group permission.
 * can update:
 * - name
 * - isDepartment
 * - permissions
 */
export class ChangeGroupPermissionCommand {
  constructor(public readonly props: ChangeGroupPermissionCommandProps) {}
}
