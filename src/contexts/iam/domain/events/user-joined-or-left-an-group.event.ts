import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { Group, User } from '@iam/domain/entities';

export interface UserJoinedOrLeftAnGroupEventProps {
  userId: string;
  groupId: string;
  action: 'subscribe' | 'unsubscribe';
}
export class UserJoinedOrLeftAnGroupEvent extends DomainEvent<UserJoinedOrLeftAnGroupEventProps> {
  constructor(user: User, group: Group, action: 'subscribe' | 'unsubscribe') {
    super({
      userId: user.id.value,
      groupId: group.id.value,
      action,
    });
  }
}
