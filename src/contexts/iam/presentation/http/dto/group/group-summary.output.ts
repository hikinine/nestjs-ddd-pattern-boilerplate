import { Group } from '@iam/domain/entities';

export class GroupSummaryOutput {
  id: string;
  name: string;
  isDepartment: boolean;
  permissions: {
    module: string;
    permissionEncoded: string;
  }[];

  constructor(group: Group) {
    this.id = group.id.value;
    this.name = group.name;
    this.isDepartment = group.isDepartment;
    this.permissions = group.permissions.map((permission) => ({
      module: permission.entity,
      permissionEncoded: permission.bitmap,
    }));
  }
}
