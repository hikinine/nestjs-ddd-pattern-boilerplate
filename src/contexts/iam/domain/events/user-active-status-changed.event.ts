import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { User } from '@iam/domain/entities';

export interface UserActiveStatusChangedEventProps {
  id: string;
}

export class UserActiveStatusChangedEvent extends DomainEvent<UserActiveStatusChangedEventProps> {
  constructor(user: User) {
    super({ id: user.id.value });
  }
}
