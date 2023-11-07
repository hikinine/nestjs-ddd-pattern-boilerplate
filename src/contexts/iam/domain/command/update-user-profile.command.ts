import { User } from '@iam/domain/entities';
import { Username } from '@iam/domain/value-object';
import { Address, Phone } from '@shared/domain';

export type UpdateUserProfilePropsToChangeCommand = Partial<{
  firstName?: Username;
  lastName?: Username;
  phone?: Phone;
  office?: string;
  avatar?: string;
  birthday?: Date;
  gender?: 'M' | 'F' | 'O';
  address?: Address;
}>;

export class UpdateUserProfileCommand {
  constructor(
    public readonly user: User,
    public readonly propsToChange: UpdateUserProfilePropsToChangeCommand,
  ) {}
}
