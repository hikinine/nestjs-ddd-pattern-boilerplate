import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { User } from '@iam/domain/entities';

export interface UserCreatedEventProps {
  id: string;
}

export class UserCreatedEvent extends DomainEvent<UserCreatedEventProps> {
  constructor(user: User) {
    super({ id: user.id.value });
  }
}
