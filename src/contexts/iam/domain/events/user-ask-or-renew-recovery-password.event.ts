import { DomainEvent } from '@hiki9/rich-domain/dist/core';
import { RecoveryPassword, User } from '@iam/domain/entities';

export interface UserAskOrRenewRecoveryPasswordEventProps {
  userId: string;
  recoveryId: string;
}

export class UserAskOrRenewRecoveryPasswordEvent extends DomainEvent<UserAskOrRenewRecoveryPasswordEventProps> {
  constructor(user: User, recovery: RecoveryPassword) {
    super({
      userId: user.id.value,
      recoveryId: recovery.id.value,
    });
  }
}
