import { Adapter } from '@hiki9/rich-domain';
import { Auth, UserProps } from '@iam/domain/entities';
import { OAuth, Password, Username } from '@iam/domain/value-object';
import { CreateUserInput } from '@iam/presentation/http/dto';
import { Injectable } from '@nestjs/common';
import { Email, Phone } from '@shared/domain';

@Injectable()
export class CreateUserInputAdapter
  implements Adapter<CreateUserInput, UserProps>
{
  public build(dto: CreateUserInput): UserProps {
    const groups = [];
    const permissions = [];
    const isActive = true;

    const office = dto.office;
    const email = new Email(dto.email);
    const username = new Username(dto.username);
    const phone = new Phone(dto.phone);

    const auth = new Auth({
      password: Password.createFromPlain(dto.password),
      refreshToken: [],
      activeRecoveryPassword: [],
      oauth: [],
    });

    if (dto.externalUserProviderId) {
      const { externalUserProviderId } = dto;
      const oauth = new OAuth({ externalUserProviderId, provider: 'GOOGLE' });
      auth.oauth.push(oauth);
    }

    const props: UserProps = {
      email,
      isActive,
      username,
      phone,
      office,
      auth,
      groups,
      permissions,
    };

    return props;
  }
}
