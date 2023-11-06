import { Domain } from '@hiki9/rich-domain';
import { V } from '@lib/utils';

export interface OAuthProps {
  provider: string;
  externalUserProviderId: string;
}

export class OAuth extends Domain.ValueObject<OAuthProps> {
  protected static hooks = Domain.VoHooks({
    validation,
  });

  get externalUserId(): string {
    return this.value.externalUserProviderId;
  }
}

function validation(value: OAuthProps) {
  if (V.notTypeOf(value.provider, 'string')) {
    return { message: 'Formato inválido para provider' };
  }

  if (V.notTypeOf(value.externalUserProviderId, 'string')) {
    return { message: 'Formato inválido para externalUserProviderId' };
  }
}
