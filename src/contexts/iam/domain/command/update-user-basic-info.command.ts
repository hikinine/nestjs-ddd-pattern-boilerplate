import { User } from '@iam/domain/entities';
import { Username } from '@iam/domain/value-object';
import { Phone } from '@shared/domain';

export type UpdateUserBasicInfoPropsToChangeCommand = Partial<{
  username: Username;
  office: string;
  phone: Phone;
}>;

export class UpdateUserBasicInfoCommand {
  constructor(
    public readonly user: User,
    public readonly propsToChange: UpdateUserBasicInfoPropsToChangeCommand,
  ) {}
}
