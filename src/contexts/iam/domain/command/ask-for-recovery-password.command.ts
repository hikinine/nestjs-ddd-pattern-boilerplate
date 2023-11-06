import { User } from '@iam/domain/entities';

/**
 * User ask for recovery password.
 * Get on going recovery password if exists.
 * if countHowManyTillExpires() < hours(2) renew it.
 * @command ask-for-recovery-password
 * @event UserAskOrRenewRecoveryPasswordEvent
 * @param user
 * @resolves RecoveryPassword
 */
export class AskForRecoveryPasswordCommand {
  constructor(public readonly user: User) {}
}
