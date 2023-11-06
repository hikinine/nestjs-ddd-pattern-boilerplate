import { Domain, DomainError } from '@hiki9/rich-domain';
import * as bcrypt from 'bcrypt';

export interface PasswordProps {
  hash: string;
  strategy?: string;
  salts?: number;
}
/**
 * TODO
 * should pass bcrypt as strategy dependency
 */
export class Password extends Domain.ValueObject<PasswordProps> {
  private static readonly saltRounds = 10;
  constructor(createFromHash: string) {
    super({
      hash: createFromHash,
      strategy: 'bcrypt',
      salts: Password.saltRounds,
    });
  }

  public matchs(plainText: string) {
    return bcrypt.compareSync(plainText, this.getPasswordHash());
  }
  public getPasswordHash(): string {
    return this._value.hash;
  }
  public static createFromHash(hash: string): Password {
    return new Password(hash);
  }
  public static createFromPlain(plain: string): Password {
    if (plain.length < 8) {
      throw new DomainError('A senha deve ter no mínimo 8 caracteres.');
    }
    const hash = bcrypt.hashSync(plain, this.saltRounds);
    return new Password(hash);
  }
}
