import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { User } from '@iam/domain/entities';

export interface UserPasswordWasChangedEventProps {
  id: string;
}

export class UserPasswordWasChangedEvent extends DomainEvent<UserPasswordWasChangedEventProps> {
  constructor(user: User) {
    super({ id: user.id.value });
  }
}
