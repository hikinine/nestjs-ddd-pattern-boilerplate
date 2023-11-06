import { User } from '@iam/domain/entities';

export class UserSummary {
  id: string;
  username: string;
  email: string;
  office: string;
  groups: { id: string; name: string }[];

  constructor(user: User) {
    this.id = user.id.value;
    this.office = user.office;
    this.username = user.username.value;
    this.email = user.email.value;
    this.groups = user.groups?.map((group) => ({
      id: group.id.value,
      name: group.name,
    }));
  }
}
