import { User } from '@iam/domain/entities';

export class UserOutput {
  id: string;
  username: string;
  email: string;
  office: string;
  isActive: boolean;
  phone: string;
  groups: {
    id: string;
    name: string;
    isDepartment: boolean;
  }[];
  encodedPermissions: string[];
  createdAt: Date;

  constructor(user: User) {
    this.id = user.id.value;
    this.username = user.username.value;
    this.email = user.email.value;
    this.office = user.office;
    this.isActive = user.active;
    this.phone = user.phone.value;
    this.encodedPermissions = user.permissions.map(
      (permission) => permission.bitmap,
    );

    this.groups = user.groups.map((group) => ({
      id: group.id.value,
      name: group.name,
      isDepartment: group.isDepartment,
    }));
    this.createdAt = user.createdAt;
  }
}
