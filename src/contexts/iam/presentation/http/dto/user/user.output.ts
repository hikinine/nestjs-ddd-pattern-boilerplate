import { User } from '@iam/domain/entities';

export class UserOutput {
  id: string;
  email: string;
  isActive: boolean;
  encodedPermissions: string[];
  createdAt: Date;
  profile: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone?: string;
    office?: string;
    avatar?: string;
    birthday?: Date;
    gender?: 'M' | 'F' | 'O';
    address?: {
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      extra?: string;
      zipCode?: string;
    };
  };
  groups: {
    id: string;
    name: string;
    isDepartment: boolean;
  }[];

  constructor(user: User) {
    this.id = user.id.value;
    this.profile = user.profile.toPrimitives();
    this.email = user.email.value;
    this.isActive = user.active;
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
