import { User } from '@iam/domain/entities';

export class UserSummary {
  id: string;
  email: string;
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
  groups: { id: string; name: string }[];

  constructor(user: User) {
    this.id = user.id.value;
    this.email = user.email.value;
    this.profile = user.profile.toPrimitives();

    this.groups = user.groups?.map((group) => ({
      id: group.id.value,
      name: group.name,
    }));
  }
}
